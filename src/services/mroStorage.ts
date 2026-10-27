/**
 * Client-Side API & Multi-Device Real-Time Sync Service
 * Connects to Express fullstack server with SSE listener and fallback persistence
 */
import {
  MroDatabase,
  AppSettings,
  CategoryTreeItem,
  StorageLocation,
  SparePart,
  MonthlyInventoryLog,
  SyncStatus,
  ReceiverItem,
  WorkshopItem,
  DepartmentItem,
  StockTransaction
} from '../types/mro';
import { INITIAL_DATABASE } from '../data/initialData';

// Generate or retrieve persistent device ID for this workstation
export function getWorkstationDeviceId(): string {
  let id = localStorage.getItem('mro_device_id');
  if (!id) {
    id = `PC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    localStorage.setItem('mro_device_id', id);
  }
  return id;
}

const LOCAL_CACHE_KEY = 'mro_cached_database_v2';

export class MroStorageService {
  private static instance: MroStorageService;
  private db: MroDatabase = INITIAL_DATABASE;
  private listeners: Set<(db: MroDatabase) => void> = new Set();
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();
  private eventSource: EventSource | null = null;
  private isOnline: boolean = true;
  private workstationsCount: number = 1;
  private deviceId: string = getWorkstationDeviceId();
  private pollInterval: any = null;

  private constructor() {
    try {
      localStorage.removeItem('mro_cached_database_v1');
    } catch {}
    // Load local cache if available for instant paint
    const cached = localStorage.getItem(LOCAL_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.parts) && Array.isArray(parsed.categories)) {
          const mergedLogs = { ...INITIAL_DATABASE.inventory_logs, ...(parsed.inventory_logs || {}) };
          for (const [k, v] of Object.entries(INITIAL_DATABASE.inventory_logs)) {
            if (v.daily_receives && mergedLogs[k] && !mergedLogs[k].daily_receives) {
              mergedLogs[k].daily_receives = v.daily_receives;
            }
          }

          this.db = {
            ...INITIAL_DATABASE,
            ...parsed,
            inventory_logs: mergedLogs,
            settings: {
              ...INITIAL_DATABASE.settings,
              ...(parsed.settings || {}),
              signatures: (parsed.settings?.signatures && parsed.settings.signatures.length > 0)
                ? parsed.settings.signatures
                : INITIAL_DATABASE.settings.signatures
            },
            receivers: Array.isArray(parsed.receivers) && parsed.receivers.length > 0 ? parsed.receivers : INITIAL_DATABASE.receivers,
            workshops: Array.isArray(parsed.workshops) && parsed.workshops.length > 0 ? parsed.workshops : INITIAL_DATABASE.workshops,
            departments: Array.isArray(parsed.departments) && parsed.departments.length > 0 ? parsed.departments : INITIAL_DATABASE.departments,
            transactions: Array.isArray(parsed.transactions) && parsed.transactions.length > 0 ? parsed.transactions : (INITIAL_DATABASE.transactions || [])
          };
        }
      } catch (e) {
        console.error('Failed to parse cached database', e);
      }
    }
    this.initSync();
  }

  public static getInstance(): MroStorageService {
    if (!MroStorageService.instance) {
      MroStorageService.instance = new MroStorageService();
    }
    return MroStorageService.instance;
  }

  // Subscribe to database changes
  public subscribe(listener: (db: MroDatabase) => void): () => void {
    this.listeners.add(listener);
    listener(this.db);
    return () => this.listeners.delete(listener);
  }

  // Subscribe to sync status
  public subscribeSync(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(listener);
    this.emitSync();
    return () => this.syncListeners.delete(listener);
  }

  private emitChange(): void {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(this.db));
    for (const listener of this.listeners) {
      listener(this.db);
    }
  }

  private emitSync(): void {
    const status: SyncStatus = {
      connected: this.isOnline,
      workstations_online: Math.max(1, this.workstationsCount),
      last_synced: new Date().toLocaleTimeString(),
      device_id: this.deviceId
    };
    for (const listener of this.syncListeners) {
      listener(status);
    }
  }

  // Fetch full state from backend
  public async fetchFullDatabase(): Promise<MroDatabase> {
    try {
      const res = await fetch('/api/mro/db', {
        headers: { 'X-Device-Id': this.deviceId }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      this.db = data;
      this.isOnline = true;
      if (typeof data.onlineWorkstations === 'number') {
        this.workstationsCount = data.onlineWorkstations;
      }
      this.emitChange();
      this.emitSync();
      return this.db;
    } catch (err) {
      console.warn('Backend fetch failed, using cached state:', err);
      this.isOnline = false;
      this.emitSync();
      return this.db;
    }
  }

  // Initialize Real-time SSE Multi-Workstation Connection
  private initSync(): void {
    this.fetchFullDatabase();

    const connectSSE = () => {
      if (this.eventSource) {
        this.eventSource.close();
      }

      const sseUrl = `/api/mro/events?deviceId=${encodeURIComponent(this.deviceId)}`;
      try {
        this.eventSource = new EventSource(sseUrl);

        this.eventSource.onopen = () => {
          this.isOnline = true;
          this.emitSync();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.onlineWorkstations) {
              this.workstationsCount = data.onlineWorkstations;
            }

            // If change originated from ANOTHER computer, fetch updated state
            if (data.senderDeviceId && data.senderDeviceId !== this.deviceId) {
              console.log(`Live update received from workstation ${data.senderDeviceId}:`, data.type);
              this.fetchFullDatabase();
            } else if (data.type === 'DB_RESET' || data.type === 'DB_REPLACED') {
              this.fetchFullDatabase();
            }
            this.emitSync();
          } catch (e) {
            console.error('Error parsing SSE event', e);
          }
        };

        this.eventSource.onerror = () => {
          this.isOnline = false;
          this.emitSync();
          // Retry SSE in 4 seconds
          setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        console.warn('SSE not supported or failed to initialize', err);
      }
    };

    connectSSE();

    // Secondary safety poll every 15s to keep all clients perfectly aligned
    this.pollInterval = setInterval(() => {
      this.fetchFullDatabase();
    }, 15000);
  }

  // Get current DB snapshot
  public getSnapshot(): MroDatabase {
    return this.db;
  }

  // Save Settings
  public async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const updated = { ...this.db.settings, ...settings };
    this.db.settings = updated as AppSettings;
    this.emitChange();

    try {
      const res = await fetch('/api/mro/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const saved = await res.json();
        this.db.settings = saved;
        this.emitChange();
        return saved;
      }
    } catch (e) {
      console.error('Failed to sync settings to server', e);
    }
    return this.db.settings;
  }

  // Spare Parts CRUD
  public async savePart(part: SparePart): Promise<SparePart> {
    const idx = this.db.parts.findIndex(p => p.id === part.id);
    const now = new Date().toISOString();
    const updatedPart = {
      ...part,
      updated_at: now,
      created_at: part.created_at || now
    };

    if (idx >= 0) {
      this.db.parts[idx] = updatedPart;
    } else {
      this.db.parts.push(updatedPart);
    }
    this.emitChange();

    try {
      await fetch('/api/mro/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify(updatedPart)
      });
    } catch (e) {
      console.error('Failed to sync part to server', e);
    }
    return updatedPart;
  }

  public async deletePart(partId: string): Promise<boolean> {
    this.db.parts = this.db.parts.filter(p => p.id !== partId);
    Object.keys(this.db.inventory_logs).forEach(key => {
      if (key.endsWith(`_${partId}`)) {
        delete this.db.inventory_logs[key];
      }
    });
    this.emitChange();

    try {
      await fetch(`/api/mro/parts/${encodeURIComponent(partId)}`, {
        method: 'DELETE',
        headers: { 'X-Device-Id': this.deviceId }
      });
      return true;
    } catch (e) {
      console.error('Failed to delete part on server', e);
      return false;
    }
  }

  // Category CRUD
  public async saveCategory(cat: CategoryTreeItem): Promise<CategoryTreeItem> {
    const idx = this.db.categories.findIndex(c => c.id === cat.id);
    if (idx >= 0) {
      this.db.categories[idx] = { ...this.db.categories[idx], ...cat };
    } else {
      this.db.categories.push(cat);
    }
    this.emitChange();

    try {
      await fetch('/api/mro/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify(cat)
      });
    } catch (e) {
      console.error('Failed to sync category to server', e);
    }
    return cat;
  }

  public async deleteCategory(catId: string): Promise<boolean> {
    this.db.categories = this.db.categories.filter(c => c.id !== catId);
    this.emitChange();

    try {
      await fetch(`/api/mro/categories/${encodeURIComponent(catId)}`, {
        method: 'DELETE',
        headers: { 'X-Device-Id': this.deviceId }
      });
      return true;
    } catch (e) {
      console.error('Failed to delete category on server', e);
      return false;
    }
  }

  // Storage Locations CRUD
  public async saveLocation(loc: StorageLocation): Promise<StorageLocation> {
    if (!loc.barcode) {
      loc.barcode = `LOC-${loc.group_code.toUpperCase()}-${String(loc.column_no || 1).padStart(2, '0')}-${String(loc.row_no || 1).padStart(2, '0')}`;
    }
    const idx = this.db.locations.findIndex(l => l.id === loc.id);
    if (idx >= 0) {
      this.db.locations[idx] = { ...this.db.locations[idx], ...loc };
    } else {
      this.db.locations.push(loc);
    }
    this.emitChange();

    try {
      await fetch('/api/mro/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify(loc)
      });
    } catch (e) {
      console.error('Failed to sync location to server', e);
    }
    return loc;
  }

  public async deleteLocation(locId: string): Promise<boolean> {
    this.db.locations = this.db.locations.filter(l => l.id !== locId);
    this.emitChange();

    try {
      await fetch(`/api/mro/locations/${encodeURIComponent(locId)}`, {
        method: 'DELETE',
        headers: { 'X-Device-Id': this.deviceId }
      });
      return true;
    } catch (e) {
      console.error('Failed to delete location on server', e);
      return false;
    }
  }

  // Update Inventory Log & 31-day daily issue with instant optimistic calculation
  public async updateInventoryLog(
    monthKey: string,
    partId: string,
    delta: Partial<MonthlyInventoryLog>
  ): Promise<MonthlyInventoryLog> {
    const key = `${monthKey}_${partId}`;
    const existing = this.db.inventory_logs[key] || {
      id: key,
      month_key: monthKey,
      part_id: partId,
      beginning_stock: 0,
      received_in_month: 0,
      daily_issues: {},
      daily_receives: {},
      total_issue: 0,
      current_stock: 0,
      notes: ''
    };

    const daily = { ...(existing.daily_issues || {}), ...(delta.daily_issues || {}) };
    const dailyReceives = { ...(existing.daily_receives || {}), ...(delta.daily_receives || {}) };

    let totalIssue = 0;
    for (let i = 1; i <= 31; i++) {
      const v = daily[`day_${i}`];
      if (typeof v === 'number' && !isNaN(v)) {
        totalIssue += Math.max(0, v);
      }
    }

    let received = delta.received_in_month !== undefined ? delta.received_in_month : existing.received_in_month;
    if (delta.daily_receives !== undefined) {
      let sumRec = 0;
      for (let i = 1; i <= 31; i++) {
        const v = dailyReceives[`day_${i}`];
        if (typeof v === 'number' && !isNaN(v)) {
          sumRec += Math.max(0, v);
        }
      }
      received = sumRec;
    }

    const beginning = delta.beginning_stock !== undefined ? delta.beginning_stock : existing.beginning_stock;
    const current = (beginning + received) - totalIssue;

    const updatedLog: MonthlyInventoryLog = {
      ...existing,
      ...delta,
      id: key,
      month_key: monthKey,
      part_id: partId,
      beginning_stock: beginning,
      received_in_month: received,
      daily_issues: daily,
      daily_receives: dailyReceives,
      total_issue: totalIssue,
      current_stock: current,
      notes: delta.notes !== undefined ? delta.notes : existing.notes,
      last_updated: new Date().toISOString()
    };

    // Instant optimistic update
    this.db.inventory_logs[key] = updatedLog;
    this.emitChange();

    // Async server sync
    try {
      await fetch(`/api/mro/logs/${encodeURIComponent(monthKey)}/${encodeURIComponent(partId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify(updatedLog)
      });
    } catch (e) {
      console.error('Failed to sync inventory log to server', e);
    }

    return updatedLog;
  }

  // Restore or Reset full database
  public async resetToFactoryDefault(): Promise<void> {
    try {
      await fetch('/api/mro/reset', {
        method: 'POST',
        headers: { 'X-Device-Id': this.deviceId }
      });
      await this.fetchFullDatabase();
    } catch (e) {
      console.error('Reset failed on server, resetting locally', e);
      this.db = JSON.parse(JSON.stringify(INITIAL_DATABASE));
      this.emitChange();
    }
  }

  public async importFullDatabase(importedDb: MroDatabase): Promise<void> {
    this.db = importedDb;
    this.emitChange();
    try {
      await fetch('/api/mro/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify(importedDb)
      });
    } catch (e) {
      console.error('Import failed to sync to server', e);
    }
  }

  // Receivers (Người Nhận Hàng / Thợ Máy) CRUD
  public async saveReceiver(receiver: ReceiverItem): Promise<ReceiverItem> {
    if (!this.db.receivers) this.db.receivers = [];
    const idx = this.db.receivers.findIndex(r => r.id === receiver.id);
    if (idx >= 0) {
      this.db.receivers[idx] = { ...this.db.receivers[idx], ...receiver };
    } else {
      this.db.receivers.push(receiver);
    }
    this.emitChange();

    try {
      await fetch('/api/mro/receivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify(receiver)
      });
    } catch (e) {
      console.error('Failed to sync receiver to server', e);
    }
    return receiver;
  }

  public async deleteReceiver(receiverId: string): Promise<boolean> {
    this.db.receivers = (this.db.receivers || []).filter(r => r.id !== receiverId);
    this.emitChange();

    try {
      await fetch(`/api/mro/receivers/${encodeURIComponent(receiverId)}`, {
        method: 'DELETE',
        headers: { 'X-Device-Id': this.deviceId }
      });
      return true;
    } catch (e) {
      console.error('Failed to delete receiver on server', e);
      return false;
    }
  }

  // Workshops (Xưởng) CRUD
  public async saveWorkshop(workshop: WorkshopItem): Promise<WorkshopItem> {
    if (!this.db.workshops) this.db.workshops = [];
    const idx = this.db.workshops.findIndex(w => w.id === workshop.id);
    if (idx >= 0) {
      this.db.workshops[idx] = { ...this.db.workshops[idx], ...workshop };
    } else {
      this.db.workshops.push(workshop);
    }
    this.emitChange();

    try {
      await fetch('/api/mro/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify(workshop)
      });
    } catch (e) {
      console.error('Failed to sync workshop to server', e);
    }
    return workshop;
  }

  public async deleteWorkshop(workshopId: string): Promise<boolean> {
    this.db.workshops = (this.db.workshops || []).filter(w => w.id !== workshopId);
    this.emitChange();

    try {
      await fetch(`/api/mro/workshops/${encodeURIComponent(workshopId)}`, {
        method: 'DELETE',
        headers: { 'X-Device-Id': this.deviceId }
      });
      return true;
    } catch (e) {
      console.error('Failed to delete workshop on server', e);
      return false;
    }
  }

  // Departments (Bộ Phận) CRUD
  public async saveDepartment(dept: DepartmentItem): Promise<DepartmentItem> {
    if (!this.db.departments) this.db.departments = [];
    const idx = this.db.departments.findIndex(d => d.id === dept.id);
    if (idx >= 0) {
      this.db.departments[idx] = { ...this.db.departments[idx], ...dept };
    } else {
      this.db.departments.push(dept);
    }
    this.emitChange();

    try {
      await fetch('/api/mro/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify(dept)
      });
    } catch (e) {
      console.error('Failed to sync department to server', e);
    }
    return dept;
  }

  public async deleteDepartment(deptId: string): Promise<boolean> {
    this.db.departments = (this.db.departments || []).filter(d => d.id !== deptId);
    this.emitChange();

    try {
      await fetch(`/api/mro/departments/${encodeURIComponent(deptId)}`, {
        method: 'DELETE',
        headers: { 'X-Device-Id': this.deviceId }
      });
      return true;
    } catch (e) {
      console.error('Failed to delete department on server', e);
      return false;
    }
  }

  // Stock In / Out Transaction Record (Optimistic + Server Sync)
  public async recordStockInOut(tx: StockTransaction): Promise<{ success: boolean; log: MonthlyInventoryLog }> {
    const monthKey = tx.month_key;
    const partId = tx.part_id;
    const key = `${monthKey}_${partId}`;

    const existing = this.db.inventory_logs[key] || {
      id: key,
      month_key: monthKey,
      part_id: partId,
      beginning_stock: 0,
      received_in_month: 0,
      daily_issues: {},
      total_issue: 0,
      current_stock: 0,
      notes: ''
    };

    const updatedDaily = { ...(existing.daily_issues || {}) };
    const updatedDailyReceives = { ...(existing.daily_receives || {}) };
    let updatedReceived = existing.received_in_month || 0;

    if (tx.type === 'IN') {
      const dayKey = `day_${tx.day || 1}`;
      updatedDailyReceives[dayKey] = (updatedDailyReceives[dayKey] || 0) + tx.quantity;
      updatedReceived += tx.quantity;
    } else if (tx.type === 'OUT') {
      const dayKey = `day_${tx.day || 1}`;
      updatedDaily[dayKey] = (updatedDaily[dayKey] || 0) + tx.quantity;
    }

    let totalIssue = 0;
    for (let i = 1; i <= 31; i++) {
      const val = updatedDaily[`day_${i}`];
      if (typeof val === 'number' && !isNaN(val)) {
        totalIssue += Math.max(0, val);
      }
    }
    const currentStock = (existing.beginning_stock + updatedReceived) - totalIssue;

    const updatedLog: MonthlyInventoryLog = {
      ...existing,
      received_in_month: updatedReceived,
      daily_issues: updatedDaily,
      daily_receives: updatedDailyReceives,
      total_issue: totalIssue,
      current_stock: currentStock,
      last_updated: new Date().toISOString()
    };

    this.db.inventory_logs[key] = updatedLog;
    if (!this.db.transactions) this.db.transactions = [];
    this.db.transactions.unshift(tx);

    this.emitChange();

    try {
      await fetch('/api/mro/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify(tx)
      });
    } catch (e) {
      console.error('Failed to sync transaction to server', e);
    }

    return { success: true, log: updatedLog };
  }
}

export const mroService = MroStorageService.getInstance();

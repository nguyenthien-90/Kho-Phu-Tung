import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { INITIAL_DATABASE } from './src/data/initialData';
import { MroDatabase, MonthlyInventoryLog } from './src/types/mro';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DB_FILE_PATH = path.join(__dirname, 'data', 'mro_database.json');

// Ensure data folder exists and database file is initialized
function getDatabase(): MroDatabase {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const dataDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
      return INITIAL_DATABASE;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as MroDatabase;
    const mergedLogs = { ...INITIAL_DATABASE.inventory_logs, ...(parsed.inventory_logs || {}) };
    for (const [k, v] of Object.entries(INITIAL_DATABASE.inventory_logs)) {
      if (v.daily_receives && mergedLogs[k] && !mergedLogs[k].daily_receives) {
        mergedLogs[k].daily_receives = v.daily_receives;
      }
    }

    return {
      ...INITIAL_DATABASE,
      ...parsed,
      inventory_logs: mergedLogs,
      receivers: Array.isArray(parsed.receivers) && parsed.receivers.length > 0 ? parsed.receivers : INITIAL_DATABASE.receivers,
      workshops: Array.isArray(parsed.workshops) && parsed.workshops.length > 0 ? parsed.workshops : INITIAL_DATABASE.workshops,
      departments: Array.isArray(parsed.departments) && parsed.departments.length > 0 ? parsed.departments : INITIAL_DATABASE.departments,
      transactions: Array.isArray(parsed.transactions) && parsed.transactions.length > 0 ? parsed.transactions : (INITIAL_DATABASE.transactions || [])
    };
  } catch (err) {
    console.error('Error reading database file, using in-memory fallback:', err);
    return INITIAL_DATABASE;
  }
}

function saveDatabase(db: MroDatabase): void {
  try {
    db.version = (db.version || 1) + 1;
    db.last_modified = new Date().toISOString();
    const dataDir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// In-memory reference
let db: MroDatabase = getDatabase();

// Track connected workstations for multi-computer real-time sync
const sseClients = new Set<{ id: string; res: Response }>();

function broadcastChange(type: string, payload: any, senderDeviceId?: string) {
  const message = JSON.stringify({
    type,
    payload,
    senderDeviceId,
    timestamp: new Date().toISOString(),
    onlineWorkstations: sseClients.size
  });

  for (const client of sseClients) {
    try {
      client.res.write(`data: ${message}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Device-Id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Real-Time Multi-Computer SSE Connection
app.get('/api/mro/events', (req: Request, res: Response) => {
  const clientId = (req.query.deviceId as string) || `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const client = { id: clientId, res };
  sseClients.add(client);

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId, onlineWorkstations: sseClients.size })}\n\n`);

  // Broadcast updated workstation count
  broadcastChange('WORKSTATION_JOINED', { activeClients: sseClients.size }, clientId);

  req.on('close', () => {
    sseClients.delete(client);
    broadcastChange('WORKSTATION_LEFT', { activeClients: sseClients.size });
  });
});

// Full DB Endpoints
app.get('/api/mro/db', (req: Request, res: Response) => {
  res.json({
    ...db,
    onlineWorkstations: sseClients.size
  });
});

app.post('/api/mro/db', (req: Request, res: Response) => {
  const newDb = req.body;
  if (!newDb || !newDb.parts || !newDb.settings) {
    return res.status(400).json({ error: 'Invalid database payload' });
  }
  db = newDb;
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('DB_REPLACED', { version: db.version }, deviceId);
  res.json({ success: true, version: db.version, last_modified: db.last_modified });
});

// Reset to JS Corp Factory Seed Data
app.post('/api/mro/reset', (req: Request, res: Response) => {
  db = JSON.parse(JSON.stringify(INITIAL_DATABASE));
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('DB_RESET', { version: db.version }, deviceId);
  res.json({ success: true, message: 'Database reset to factory default' });
});

// Settings API
app.get('/api/mro/settings', (req: Request, res: Response) => {
  res.json(db.settings);
});

app.put('/api/mro/settings', (req: Request, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('SETTINGS_UPDATED', db.settings, deviceId);
  res.json(db.settings);
});

// Categories API
app.get('/api/mro/categories', (req: Request, res: Response) => {
  res.json(db.categories);
});

app.post('/api/mro/categories', (req: Request, res: Response) => {
  const category = req.body;
  if (!category.id || !category.name || !category.type) {
    return res.status(400).json({ error: 'Missing required category fields' });
  }
  const existingIdx = db.categories.findIndex(c => c.id === category.id);
  if (existingIdx >= 0) {
    db.categories[existingIdx] = { ...db.categories[existingIdx], ...category };
  } else {
    db.categories.push(category);
  }
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('CATEGORIES_UPDATED', db.categories, deviceId);
  res.json(category);
});

app.delete('/api/mro/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.categories = db.categories.filter(c => c.id !== id);
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('CATEGORIES_UPDATED', db.categories, deviceId);
  res.json({ success: true, id });
});

// Storage Locations API
app.get('/api/mro/locations', (req: Request, res: Response) => {
  res.json(db.locations);
});

app.post('/api/mro/locations', (req: Request, res: Response) => {
  const loc = req.body;
  if (!loc.id || !loc.group_code) {
    return res.status(400).json({ error: 'Missing required location fields' });
  }
  // Auto-generate barcode if not set
  if (!loc.barcode) {
    loc.barcode = `LOC-${loc.group_code.toUpperCase()}-${String(loc.column_no || 1).padStart(2, '0')}-${String(loc.row_no || 1).padStart(2, '0')}`;
  }
  const existingIdx = db.locations.findIndex(l => l.id === loc.id);
  if (existingIdx >= 0) {
    db.locations[existingIdx] = { ...db.locations[existingIdx], ...loc };
  } else {
    db.locations.push(loc);
  }
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('LOCATIONS_UPDATED', db.locations, deviceId);
  res.json(loc);
});

app.delete('/api/mro/locations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.locations = db.locations.filter(l => l.id !== id);
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('LOCATIONS_UPDATED', db.locations, deviceId);
  res.json({ success: true, id });
});

// Spare Parts API (CRUD)
app.get('/api/mro/parts', (req: Request, res: Response) => {
  res.json(db.parts);
});

app.post('/api/mro/parts', (req: Request, res: Response) => {
  const part = req.body;
  if (!part.id || !part.part_name || !part.main_cat_id) {
    return res.status(400).json({ error: 'Missing required spare part fields (id, part_name, main_cat_id)' });
  }
  const existingIdx = db.parts.findIndex(p => p.id === part.id);
  const now = new Date().toISOString();
  if (existingIdx >= 0) {
    db.parts[existingIdx] = {
      ...db.parts[existingIdx],
      ...part,
      updated_at: now
    };
  } else {
    db.parts.push({
      ...part,
      created_at: now,
      updated_at: now
    });
  }
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('PARTS_UPDATED', db.parts, deviceId);
  res.json(part);
});

app.delete('/api/mro/parts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.parts = db.parts.filter(p => p.id !== id);
  // Also clean up related inventory logs
  Object.keys(db.inventory_logs).forEach(key => {
    if (key.endsWith(`_${id}`)) {
      delete db.inventory_logs[key];
    }
  });
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('PARTS_UPDATED', db.parts, deviceId);
  res.json({ success: true, id });
});

// Receivers API (Người Nhận Hàng / Thợ Máy)
app.get('/api/mro/receivers', (req: Request, res: Response) => {
  res.json(db.receivers || []);
});

app.post('/api/mro/receivers', (req: Request, res: Response) => {
  const receiver = req.body;
  if (!receiver.id || !receiver.name) {
    return res.status(400).json({ error: 'Missing required receiver fields' });
  }
  if (!db.receivers) db.receivers = [];
  const existingIdx = db.receivers.findIndex(r => r.id === receiver.id);
  if (existingIdx >= 0) {
    db.receivers[existingIdx] = { ...db.receivers[existingIdx], ...receiver };
  } else {
    db.receivers.push(receiver);
  }
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('RECEIVERS_UPDATED', db.receivers, deviceId);
  res.json(receiver);
});

app.delete('/api/mro/receivers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.receivers = (db.receivers || []).filter(r => r.id !== id);
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('RECEIVERS_UPDATED', db.receivers, deviceId);
  res.json({ success: true, id });
});

// Workshops API (Xưởng A, B, C, D, E...)
app.get('/api/mro/workshops', (req: Request, res: Response) => {
  res.json(db.workshops || []);
});

app.post('/api/mro/workshops', (req: Request, res: Response) => {
  const workshop = req.body;
  if (!workshop.id || !workshop.name) {
    return res.status(400).json({ error: 'Missing required workshop fields' });
  }
  if (!db.workshops) db.workshops = [];
  const existingIdx = db.workshops.findIndex(w => w.id === workshop.id);
  if (existingIdx >= 0) {
    db.workshops[existingIdx] = { ...db.workshops[existingIdx], ...workshop };
  } else {
    db.workshops.push(workshop);
  }
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('WORKSHOPS_UPDATED', db.workshops, deviceId);
  res.json(workshop);
});

app.delete('/api/mro/workshops/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.workshops = (db.workshops || []).filter(w => w.id !== id);
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('WORKSHOPS_UPDATED', db.workshops, deviceId);
  res.json({ success: true, id });
});

// Departments API (Bộ Phận: Cơ điện, May chuyền, Bảo trì...)
app.get('/api/mro/departments', (req: Request, res: Response) => {
  res.json(db.departments || []);
});

app.post('/api/mro/departments', (req: Request, res: Response) => {
  const dept = req.body;
  if (!dept.id || !dept.name) {
    return res.status(400).json({ error: 'Missing required department fields' });
  }
  if (!db.departments) db.departments = [];
  const existingIdx = db.departments.findIndex(d => d.id === dept.id);
  if (existingIdx >= 0) {
    db.departments[existingIdx] = { ...db.departments[existingIdx], ...dept };
  } else {
    db.departments.push(dept);
  }
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('DEPARTMENTS_UPDATED', db.departments, deviceId);
  res.json(dept);
});

app.delete('/api/mro/departments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.departments = (db.departments || []).filter(d => d.id !== id);
  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('DEPARTMENTS_UPDATED', db.departments, deviceId);
  res.json({ success: true, id });
});

// Inventory Logs & 31-Day Issue Logs API
app.get('/api/mro/logs/:monthKey', (req: Request, res: Response) => {
  const { monthKey } = req.params;
  const filtered: Record<string, MonthlyInventoryLog> = {};
  for (const [key, val] of Object.entries(db.inventory_logs)) {
    if (val.month_key === monthKey || key.startsWith(`${monthKey}_`)) {
      filtered[key] = val;
    }
  }
  res.json(filtered);
});

// Real-time calculation helper
function calculateStockLog(log: Partial<MonthlyInventoryLog>): MonthlyInventoryLog {
  const daily = log.daily_issues || {};
  const dailyReceives = log.daily_receives || {};

  let totalIssue = 0;
  for (let i = 1; i <= 31; i++) {
    const val = daily[`day_${i}`];
    if (typeof val === 'number' && !isNaN(val)) {
      totalIssue += Math.max(0, val);
    }
  }

  const beginning = typeof log.beginning_stock === 'number' ? log.beginning_stock : 0;
  let received = typeof log.received_in_month === 'number' ? log.received_in_month : 0;

  if (log.daily_receives !== undefined) {
    let sumRec = 0;
    for (let i = 1; i <= 31; i++) {
      const v = dailyReceives[`day_${i}`];
      if (typeof v === 'number' && !isNaN(v)) {
        sumRec += Math.max(0, v);
      }
    }
    received = sumRec;
  }

  const current = (beginning + received) - totalIssue;

  return {
    id: log.id || `${log.month_key}_${log.part_id}`,
    month_key: log.month_key!,
    part_id: log.part_id!,
    beginning_stock: beginning,
    received_in_month: received,
    daily_issues: daily,
    daily_receives: dailyReceives,
    total_issue: totalIssue,
    current_stock: current,
    notes: log.notes || '',
    last_updated: new Date().toISOString()
  };
}

app.put('/api/mro/logs/:monthKey/:partId', (req: Request, res: Response) => {
  const { monthKey, partId } = req.params;
  const key = `${monthKey}_${partId}`;
  const incoming = req.body;

  const existing = db.inventory_logs[key] || {
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

  const updatedLog = calculateStockLog({
    ...existing,
    ...incoming,
    month_key: monthKey,
    part_id: partId,
    id: key
  });

  db.inventory_logs[key] = updatedLog;
  saveDatabase(db);

  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('LOG_UPDATED', { key, log: updatedLog }, deviceId);

  res.json(updatedLog);
});

// Batch update logs (e.g. for month initialization or batch import)
app.post('/api/mro/logs/batch', (req: Request, res: Response) => {
  const logs: MonthlyInventoryLog[] = req.body.logs;
  if (!Array.isArray(logs)) {
    return res.status(400).json({ error: 'logs must be an array' });
  }

  logs.forEach(log => {
    const calculated = calculateStockLog(log);
    db.inventory_logs[calculated.id] = calculated;
  });

  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('LOGS_BATCH_UPDATED', { count: logs.length }, deviceId);
  res.json({ success: true, count: logs.length });
});

// Stock In / Out Transaction Record API
app.post('/api/mro/transactions', (req: Request, res: Response) => {
  const tx = req.body;
  if (!tx.part_id || !tx.type || !tx.quantity) {
    return res.status(400).json({ error: 'Missing required transaction fields' });
  }

  const monthKey = tx.month_key || '2026-10';
  const partId = tx.part_id;
  const key = `${monthKey}_${partId}`;

  const existing = db.inventory_logs[key] || {
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

  const updatedLog = calculateStockLog({
    ...existing,
    received_in_month: updatedReceived,
    daily_issues: updatedDaily,
    daily_receives: updatedDailyReceives,
    month_key: monthKey,
    part_id: partId,
    id: key
  });

  db.inventory_logs[key] = updatedLog;
  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(tx);

  saveDatabase(db);
  const deviceId = req.headers['x-device-id'] as string;
  broadcastChange('TRANSACTION_RECORDED', { transaction: tx, log: updatedLog }, deviceId);
  res.json({ success: true, transaction: tx, log: updatedLog });
});

// Vite Middleware & Static Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MRO Smart Stock Control Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

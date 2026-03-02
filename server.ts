import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    note TEXT,
    date TEXT NOT NULL
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get transactions
  app.get('/api/transactions', (req, res) => {
    const { userId, startDate, endDate } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let query = 'SELECT * FROM transactions WHERE userId = ?';
    const params: any[] = [userId];

    if (startDate && endDate) {
      query += ' AND date >= ? AND date <= ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY date DESC';

    try {
      const stmt = db.prepare(query);
      const transactions = stmt.all(...params);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Add transaction
  app.post('/api/transactions', (req, res) => {
    const { id, userId, type, amount, category, note, date } = req.body;

    if (!id || !userId || !type || amount === undefined || !category || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO transactions (id, userId, type, amount, category, note, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, userId, type, amount, category, note, date);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error adding transaction:', error);
      res.status(500).json({ error: 'Failed to add transaction' });
    }
  });

  // Delete transaction
  app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    try {
      const stmt = db.prepare('DELETE FROM transactions WHERE id = ? AND userId = ?');
      const info = stmt.run(id, userId);
      
      if (info.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Transaction not found or unauthorized' });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

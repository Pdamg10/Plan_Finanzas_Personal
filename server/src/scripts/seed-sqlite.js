const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../db.sqlite');
const db = new sqlite3.Database(dbPath);

async function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function seed() {
  console.log('🌱 Starting seed with 50 transactions for user...');
  
  try {
    const email = 'demo@example.com';
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // 1. Get or Create User
    let user = await getQuery('SELECT id FROM users WHERE email = ?', [email]);
    let userId;
    
    if (!user) {
      console.log('Creating demo user...');
      const crypto = require('crypto');
      userId = crypto.randomUUID();
      await runQuery(
        `INSERT INTO users (id, email, password_hash, nombre, moneda_principal, avatar_color, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [userId, email, passwordHash, 'Usuario Demo', 'USD', 'violet']
      );
    } else {
      console.log('Demo user already exists.');
      userId = user.id;
    }

    // 2. Get or Create Account
    let account = await getQuery('SELECT id FROM accounts WHERE "userId" = ? LIMIT 1', [userId]);
    let accountId;
    if (!account) {
      console.log('Creating bank account...');
      const res = await runQuery(
        `INSERT INTO accounts (nombre, tipo, saldo_actual, moneda, "userId", created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        ['Banco Principal', 'banco', 15000, 'USD', userId]
      );
      accountId = res.lastID;
    } else {
      accountId = account.id;
    }

    // 3. Get Categories
    let categories = await allQuery('SELECT id, tipo FROM categories WHERE "userId" IS NULL OR "userId" = ?', [userId]);
    
    if (categories.length === 0) {
        console.log('Creating basic categories...');
        await runQuery(`INSERT INTO categories (nombre, tipo, icon, color, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`, ['Salario', 'ingreso', 'Briefcase', '#2ecc71']);
        await runQuery(`INSERT INTO categories (nombre, tipo, icon, color, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`, ['Comida', 'gasto', 'Utensils', '#e74c3c']);
        categories = await allQuery('SELECT id, tipo FROM categories WHERE "userId" IS NULL OR "userId" = ?', [userId]);
    }
    
    const incomeCats = categories.filter(c => c.tipo === 'ingreso').map(c => c.id);
    const expenseCats = categories.filter(c => c.tipo === 'gasto').map(c => c.id);

    // 4. Generate 50 Transactions
    console.log('Generating 50 transactions...');
    
    let inserted = 0;
    for(let i = 0; i < 50; i++) {
        const isExpense = Math.random() > 0.3; // 70% expenses
        const type = isExpense ? 'gasto' : 'ingreso';
        const cats = isExpense ? expenseCats : incomeCats;
        
        // Skip if no categories available for this type
        if (cats.length === 0) continue;
        
        const categoryId = cats[Math.floor(Math.random() * cats.length)];
        
        // Random date in last 90 days
        const daysAgo = Math.floor(Math.random() * 90);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0];

        const amount = isExpense 
            ? (Math.random() * 100 + 5).toFixed(2) 
            : (Math.random() * 2000 + 500).toFixed(2);
        
        const desc = isExpense ? `Gasto #${i+1} - Compra` : `Ingreso #${i+1} - Depósito`;

        await runQuery(
            `INSERT INTO transactions (monto, tipo, descripcion, fecha, "cuentaId", "categoriaId", "userId", recurrente, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))`,
            [amount, type, desc, dateStr, accountId, categoryId, userId]
        );
        inserted++;
    }

    console.log(`✅ Seed completed! Inserted ${inserted} transactions.`);
    console.log(`Login with: ${email} / password123`);

  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    db.close();
  }
}

seed();

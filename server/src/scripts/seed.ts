import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
require('dotenv').config();

const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'finance_planner',
};

async function seed() {
    console.log('🌱 Starting seed...');
    const client = new Client(dbConfig);
    await client.connect();

    try {
        // 1. Create or Get User
        const email = 'demo@example.com';
        const passwordHash = await bcrypt.hash('password123', 10);
        
        let userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        let userId;

        if (userResult.rows.length === 0) {
            console.log('Creating demo user...');
            const insertUser = await client.query(
                `INSERT INTO users (email, password, nombre, moneda_principal) 
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [email, passwordHash, 'Usuario Demo', 'USD']
            );
            userId = insertUser.rows[0].id;
        } else {
            console.log('Demo user already exists.');
            userId = userResult.rows[0].id;
        }

        // 2. Create Accounts
        console.log('Creating accounts...');
        const accountsData = [
            { nombre: 'Banco Principal', tipo: 'banco', saldo: 5000, moneda: 'USD' },
            { nombre: 'Billetera Efectivo', tipo: 'efectivo', saldo: 200, moneda: 'USD' },
            { nombre: 'Tarjeta Crédito Oro', tipo: 'credito', saldo: -1500, moneda: 'USD' },
            { nombre: 'Inversiones ETF', tipo: 'inversion', saldo: 12000, moneda: 'USD' }
        ];

        let accountIds = [];
        for (const acc of accountsData) {
            const res = await client.query(
                `INSERT INTO accounts (nombre, tipo, saldo_actual, moneda, "userId") 
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [acc.nombre, acc.tipo, acc.saldo, acc.moneda, userId]
            );
            accountIds.push(res.rows[0].id);
        }

        // 3. Create Categories (if not exist, assuming basic seeds exist, but lets ensure some IDs)
        // Check existing categories to map to
        const catResult = await client.query('SELECT id, nombre, tipo FROM categories');
        let incomeCats = catResult.rows.filter(c => c.tipo === 'ingreso').map(c => c.id);
        let expenseCats = catResult.rows.filter(c => c.tipo === 'gasto').map(c => c.id);

        if (incomeCats.length === 0 || expenseCats.length === 0) {
             console.log('Creating basic categories...');
             // Simple fallback insertion if empty
             const c1 = await client.query(`INSERT INTO categories (nombre, tipo, icon, color) VALUES ('Salario', 'ingreso', 'Briefcase', '#2ecc71') RETURNING id`);
             const c2 = await client.query(`INSERT INTO categories (nombre, tipo, icon, color) VALUES ('Comida', 'gasto', 'Utensils', '#e74c3c') RETURNING id`);
             incomeCats.push(c1.rows[0].id);
             expenseCats.push(c2.rows[0].id);
        }

        // 4. Generate 100 Transactions
        console.log('Generating 100 transactions...');
        for(let i = 0; i < 100; i++) {
            const isExpense = Math.random() > 0.3; // 70% expenses
            const type = isExpense ? 'gasto' : 'ingreso';
            const categories = isExpense ? expenseCats : incomeCats;
            const categoryId = categories[Math.floor(Math.random() * categories.length)];
            const accountId = accountIds[Math.floor(Math.random() * accountIds.length)];
            
            // Random date in last 90 days
            const daysAgo = Math.floor(Math.random() * 90);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const amount = isExpense 
                ? (Math.random() * 100 + 5).toFixed(2) 
                : (Math.random() * 2000 + 500).toFixed(2);
            
            const desc = isExpense ? `Gasto #${i} - Compra` : `Ingreso #${i} - Depósito`;

            await client.query(
                `INSERT INTO transactions (monto, tipo, descripcion, fecha, "cuentaId", "categoriaId", "userId")
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [amount, type, desc, date, accountId, categoryId, userId]
            );
        }

        console.log('✅ Seed completed successfully!');
        console.log(`Login with: ${email} / password123`);

    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        await client.end();
    }
}

seed();

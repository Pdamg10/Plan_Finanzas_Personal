import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Account } from '../accounts/account.entity';
import { Category } from '../categories/category.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Budget } from '../budgets/budget.entity';
import { Goal } from '../goals/goal.entity';
import { RecurringTransaction } from '../recurring/recurring.entity';
import { ConfigModule } from '@nestjs/config';

// Load env vars
ConfigModule.forRoot();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'finance_planner',
  entities: [User, Account, Category, Transaction, Budget, Goal, RecurringTransaction],
  synchronize: false, // Don't sync schema here, assume it's done by app
});

async function importLegacyData() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected!');

    const filePath = path.join(__dirname, '../../legacy_data.json');
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Found ${data.transactions?.length || 0} transactions to import.`);

    const userRepo = AppDataSource.getRepository(User);
    const accountRepo = AppDataSource.getRepository(Account);
    const categoryRepo = AppDataSource.getRepository(Category);
    const transactionRepo = AppDataSource.getRepository(Transaction);

    // 1. Get or Create User
    const email = 'migrated_user@example.com';
    let user = await userRepo.findOneBy({ email });
    if (!user) {
      console.log(`Creating user ${email}...`);
      const salt = await bcrypt.genSalt();
      const password_hash = await bcrypt.hash('password123', salt);
      user = userRepo.create({
        email,
        password_hash,
        nombre: 'Migrated User',
        moneda_principal: 'USD',
      });
      await userRepo.save(user);
    } else {
      console.log(`Using existing user ${email}`);
    }

    // 2. Map Accounts
    const accountMap = new Map<number, Account>();
    for (const acc of data.accounts || []) {
      let account = await accountRepo.findOne({
        where: { nombre: acc.name, userId: user.id },
      });

      if (!account) {
        console.log(`Creating account: ${acc.name}`);
        account = accountRepo.create({
          nombre: acc.name,
          tipo: acc.type,
          saldo_actual: acc.balance,
          moneda: 'USD',
          user: user,
          activa: true,
        });
        await accountRepo.save(account);
      }
      accountMap.set(acc.id, account);
    }

    // 3. Map Categories
    const categoryMap = new Map<number, Category>();
    for (const cat of data.categories || []) {
      let category = await categoryRepo.findOne({
        where: { nombre: cat.name, userId: user.id },
      });

      if (!category) {
        console.log(`Creating category: ${cat.name}`);
        category = categoryRepo.create({
          nombre: cat.name,
          tipo: cat.type,
          user: user,
          is_default: false,
          color: '#888888', // Default color
        });
        await categoryRepo.save(category);
      }
      categoryMap.set(cat.id, category);
    }

    // 4. Import Transactions
    let importedCount = 0;
    for (const tx of data.transactions || []) {
      const account = accountMap.get(tx.accountId);
      const category = categoryMap.get(tx.categoryId);

      if (!account) {
        console.warn(`Skipping transaction: Account ID ${tx.accountId} not found.`);
        continue;
      }

      // Check for duplicate (simple check by date, amount, desc)
      const exists = await transactionRepo.findOne({
        where: {
          fecha: tx.date,
          monto: tx.amount,
          descripcion: tx.description,
          userId: user.id,
        },
      });

      if (!exists) {
        const transaction = transactionRepo.create({
          monto: tx.amount,
          tipo: tx.type,
          descripcion: tx.description,
          fecha: tx.date,
          cuenta: account,
          categoria: category || null, // Allow null category
          user: user,
        });
        await transactionRepo.save(transaction);
        importedCount++;
      }
    }

    console.log(`Import completed. Imported ${importedCount} new transactions.`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

importLegacyData();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('db.sqlite');
db.all("PRAGMA table_info('transactions');", [], (err, rows) => {
  console.log('Schema transactions:', rows);
});
db.all("PRAGMA table_info('accounts');", [], (err, rows) => {
  console.log('Schema accounts:', rows);
});

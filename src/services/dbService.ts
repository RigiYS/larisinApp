import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const getDBConnection = async () => {
  return SQLite.openDatabase(
    { name: 'larisin-data.db', location: 'default' },
    () => console.log('SQLite Database Connected'),
    (error) => console.error('SQLite Connection Error:', error)
  );
};

export const createTables = async (db: SQLite.SQLiteDatabase) => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL,
      stock INTEGER,
      image TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT,
      items TEXT, 
      totalAmount REAL,
      status TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );`
  ];

  try {
    for (const q of queries) {
      await db.executeSql(q);
    }
    console.log('Semua tabel berhasil diverifikasi/dibuat');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error; 
  }
};

export const saveProductsLocal = async (db: SQLite.SQLiteDatabase, products: any[]) => {
  if (products.length === 0) return;
  try {
    await db.transaction((tx) => {
      for (const p of products) {
        tx.executeSql(
          `INSERT OR REPLACE INTO products (id, name, price, stock, image) VALUES (?, ?, ?, ?, ?)`,
          [p.id, p.name, p.price, p.stock, p.image || ''],
          () => {},
          (_, err) => { console.error('SQL Save Product Error:', err); return false; }
        );
      }
    });
    console.log(`Saved ${products.length} products locally`);
  } catch (error) {
    console.error('Transaction Error (Products):', error);
  }
};

export const saveTransactionsLocal = async (db: SQLite.SQLiteDatabase, transactions: any[]) => {
  if (transactions.length === 0) return;
  try {
    await db.transaction((tx) => {
      for (const t of transactions) {
        const itemsJson = JSON.stringify(t.items);
        tx.executeSql(
          `INSERT OR REPLACE INTO transactions (id, userId, items, totalAmount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [t.id, t.userId, itemsJson, t.totalAmount, t.status, t.createdAt, t.updatedAt],
          () => {},
          (_, err) => { console.error('SQL Save Transaction Error:', err); return false; }
        );
      }
    });
    console.log(`Saved ${transactions.length} transactions locally`);
  } catch (error) {
    console.error('Transaction Error (Transactions):', error);
  }
};

export const getTransactionsLocal = async (db: SQLite.SQLiteDatabase) => {
  try {
    const transactions: any[] = [];
    const results = await db.executeSql('SELECT * FROM transactions ORDER BY createdAt DESC');
    const rows = results[0].rows;

    for (let i = 0; i < rows.length; i++) {
      const item = rows.item(i);
      transactions.push({
        ...item,
        items: JSON.parse(item.items) 
      });
    }
    return transactions;
  } catch (error) {
    console.error('Error getting local transactions:', error);
    return [];
  }
};

export const getProductsLocal = async (db: SQLite.SQLiteDatabase) => {
  try {
    const products: any[] = [];
    const results = await db.executeSql('SELECT * FROM products');
    
    const rows = results[0].rows;

    for (let i = 0; i < rows.length; i++) {
      products.push(rows.item(i));
    }

    return products;
  } catch (error) {
    console.error('Error getting local products:', error);
    return [];
  }
};

export const deleteProductLocal = async (db: SQLite.SQLiteDatabase, id: string) => {
  try {
    await db.executeSql('DELETE FROM products WHERE id = ?', [id]);
  } catch (error) {
    console.error(`Error deleting product ${id} locally:`, error);
  }
};
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
  const query = `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL,
    stock INTEGER,
    image TEXT
  );`;

  await db.executeSql(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL,
    stock INTEGER,
    image TEXT
  );`);

  await db.executeSql(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT,
    items TEXT, 
    totalAmount REAL,
    status TEXT,
    createdAt TEXT,
    updatedAt TEXT
  );`);

  try {
    await db.executeSql(query);
    console.log('Table "products" created or already exists');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error; 
  }
};

export const saveProductsLocal = async (db: SQLite.SQLiteDatabase, products: any[]) => {
  if (products.length === 0) return;

  try {
    
    await db.transaction(async (tx) => {
      for (const p of products) {
        await tx.executeSql(
          `INSERT OR REPLACE INTO products (id, name, price, stock, image) VALUES (?, ?, ?, ?, ?)`,
          [p.id, p.name, p.price, p.stock, p.image || '']
        );
      }
    });
    
    console.log(`Saved ${products.length} products to local SQLite`);
  } catch (error) {
    console.error('Error saving products locally:', error);
    throw error;
  }
};

export const saveTransactionsLocal = async (db: SQLite.SQLiteDatabase, transactions: any[]) => {
  if (transactions.length === 0) return;
  try {
    await db.transaction(async (tx) => {
      for (const t of transactions) {
        const itemsJson = JSON.stringify(t.items);
        await tx.executeSql(
          `INSERT OR REPLACE INTO transactions (id, userId, items, totalAmount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [t.id, t.userId, itemsJson, t.totalAmount, t.status, t.createdAt, t.updatedAt]
        );
      }
    });
    console.log(`Saved ${transactions.length} transactions to SQLite`);
  } catch (error) {
    console.error('Error saving transactions local:', error);
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
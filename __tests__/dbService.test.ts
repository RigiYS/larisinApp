import { saveProductsLocal, getProductsLocal, createTables } from '../src/services/dbService';

jest.mock('react-native-sqlite-storage', () => ({
  enablePromise: jest.fn(),
  openDatabase: jest.fn(), 
}));

const mockTx = {
  executeSql: jest.fn(),
};

const mockDb = {
  transaction: jest.fn((cb) => {
    cb(mockTx); 
    return Promise.resolve();
  }),
  executeSql: jest.fn(),
};

describe('dbService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createTables should execute SQL to create tables', async () => {
    await createTables(mockDb as any);
    
    expect(mockDb.executeSql).toHaveBeenCalledTimes(2); 
    expect(mockDb.executeSql).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS products'));
  });

  test('saveProductsLocal should insert data correctly', async () => {
    const products = [
      { id: '1', name: 'Kopi', price: 5000, stock: 10, image: 'img.png' },
      { id: '2', name: 'Teh', price: 3000, stock: 20, image: '' }
    ];

    await saveProductsLocal(mockDb as any, products);

    expect(mockDb.transaction).toHaveBeenCalled();
    
    expect(mockTx.executeSql).toHaveBeenCalledTimes(2);
    
    expect(mockTx.executeSql).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO products'),
      ['1', 'Kopi', 5000, 10, 'img.png'],
      expect.any(Function), 
      expect.any(Function)  
    );
  });

  test('getProductsLocal should return formatted data', async () => {
    const mockResults = [{
      rows: {
        length: 1,
        item: (_index: number) => ({ id: '1', name: 'Kopi', price: 5000 }),
      },
    }];

    (mockDb.executeSql as jest.Mock).mockResolvedValue(mockResults);

    const result = await getProductsLocal(mockDb as any);

    expect(mockDb.executeSql).toHaveBeenCalledWith('SELECT * FROM products');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Kopi');
  });
});
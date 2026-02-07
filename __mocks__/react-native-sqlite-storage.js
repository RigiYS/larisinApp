const mockTransaction = (callback) => {
  const tx = {
    executeSql: jest.fn((sql, params, success, error) => {
      if (success) success(tx, { rows: { length: 0, item: (i) => null } });
    }),
  };
  callback(tx);
  return Promise.resolve(); 
};

const mockSQLite = {
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(mockTransaction),
    executeSql: jest.fn(() => Promise.resolve([{ rows: { length: 0, item: () => null } }])),
  })),
  enablePromise: jest.fn(),
};

export default mockSQLite;
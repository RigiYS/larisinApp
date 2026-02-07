import { getProducts } from '../src/services/productService';
import { getProductsLocal, saveProductsLocal } from '../src/services/dbService';
import { firebaseDb } from '../src/services/firebase';

jest.mock('../src/services/dbService');
jest.mock('../src/services/firebase', () => ({
  firebaseAuth: { currentUser: { uid: 'user123' } },
  firebaseDb: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  },
}));

describe('Product Service Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Scenario 1: Should return local data if available (Offline First)', async () => {
    (getProductsLocal as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Local Product' }
    ]);

    const result = await getProducts();

    expect(getProductsLocal).toHaveBeenCalled();
    expect(result[0].name).toBe('Local Product');
    
    expect(firebaseDb.collection).not.toHaveBeenCalled();
  });

  test('Scenario 2: Should fetch from Firebase if local is empty, then save to local', async () => {
    (getProductsLocal as jest.Mock).mockResolvedValue([]);

    const mockFirebaseSnapshot = {
      docs: [
        { id: '2', data: () => ({ name: 'Online Product', price: 10000 }) }
      ]
    };
    
    const mockGet = jest.fn().mockResolvedValue(mockFirebaseSnapshot);
    const mockWhere = jest.fn().mockReturnValue({ get: mockGet });
    (firebaseDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

    const result = await getProducts();

    expect(getProductsLocal).toHaveBeenCalled(); 
    expect(firebaseDb.collection).toHaveBeenCalledWith('products');
    expect(saveProductsLocal).toHaveBeenCalled(); 
    
    expect(result[0].name).toBe('Online Product');
  });
});
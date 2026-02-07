import { firebaseAuth, firebaseDb, firebaseStorage } from './firebase';
import { getDBConnection, saveProductsLocal, getProductsLocal } from './dbService'; 

export interface Product {
  id: string;
  userId: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const COLLECTION = 'products';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const db = await getDBConnection();
    const localProducts = await getProductsLocal(db);
    
    if (localProducts.length > 0) {
      console.log(`Loaded ${localProducts.length} products from SQLite`);
      return localProducts;
    }

    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) return [];

    const snapshot = await firebaseDb.collection(COLLECTION)
      .where('userId', '==', currentUser.uid) 
      .get();

    const onlineProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Product));

    if (onlineProducts.length > 0) {
      await saveProductsLocal(db, onlineProducts);
    }

    return onlineProducts;

  } catch (error: any) {
    console.error('Error loading products:', error);
    return [];
  }
};

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const doc = await firebaseDb.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Product;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil produk');
  }
};

export const addProduct = async (product: Omit<Product, 'id' | 'userId'>): Promise<string> => {
  const currentUser = firebaseAuth.currentUser;
  
  if (!currentUser) {
    throw new Error('User tidak terautentikasi.');
  }

  try {
    const docRef = await firebaseDb.collection(COLLECTION).add({
      ...product,
      userId: currentUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal menambah produk');
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  try {
    await firebaseDb.collection(COLLECTION).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Gagal update produk');
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await firebaseDb.collection(COLLECTION).doc(id).delete();
  } catch (error: any) {
    throw new Error(error.message || 'Gagal hapus produk');
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const snapshot = await firebaseDb
      .collection(COLLECTION)
      .where('name', '>=', query)
      .where('name', '<=', query + '\uf8ff')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Product));
  } catch (error: any) {
    throw new Error(error.message || 'Gagal cari produk');
  }
};

export const uploadProductImage = async (filePath: string, fileName: string): Promise<string> => {
  try {
    const ref = firebaseStorage.ref(`products/${fileName}`);
    await ref.putFile(filePath);
    return await ref.getDownloadURL();
  } catch (error: any) {
    throw new Error(error.message || 'Gagal upload gambar');
  }
};

export const onProductsChanged = (
  callback: (products: Product[]) => void,
  onError?: (error: Error) => void
) => {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) return () => {};

  return firebaseDb.collection(COLLECTION)
    .where('userId', '==', currentUser.uid) 
    .onSnapshot(
      async (snapshot) => {
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Product));
        
        try {
           const db = await getDBConnection();
           await saveProductsLocal(db, products);
           console.log('SQLite synced with Firestore updates.');
        } catch (err) {
           console.error('Gagal sync ke SQLite:', err);
        }
        callback(products);
      },
      (error) => {
        if (onError) onError(new Error(error.message));
      }
    );
};
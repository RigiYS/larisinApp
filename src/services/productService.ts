import { firebaseAuth, firebaseDb, firebaseStorage } from './firebase';

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

/**
 * Ambil semua produk
 */
export const getProducts = async (): Promise<Product[]> => {
  const currentUser = firebaseAuth.currentUser;
  
  if (!currentUser) return []; // Atau throw error

  try {
    // Gunakan query .where() seperti di transactionService
    const snapshot = await firebaseDb.collection(COLLECTION)
      .where('userId', '==', currentUser.uid) 
      .get();

    console.log(`Loaded ${snapshot.docs.length} products for user ${currentUser.uid}`);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Product));
  } catch (error: any) {
    console.error('Error loading products:', error);
    throw new Error(error.message || 'Gagal mengambil produk');
  }
};

/**
 * Ambil satu produk berdasarkan ID
 */
export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const doc = await firebaseDb.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
    } as Product;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil produk');
  }
};

/**
 * Tambah produk baru
 */
export const addProduct = async (product: Omit<Product, 'id' | 'userId'>): Promise<string> => {
  const currentUser = firebaseAuth.currentUser;
  
  // Kritik: Anda tidak boleh membiarkan operasi DB tanpa user yang jelas
  if (!currentUser) {
    throw new Error('User tidak terautentikasi. Dilarang menambah produk.');
  }

  try {
    const docRef = await firebaseDb.collection(COLLECTION).add({
      ...product,
      userId: currentUser.uid, // <--- INI KUNCINYA. Tempelkan ID pemilik.
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal menambah produk');
  }
};

/**
 * Update produk
 */
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

/**
 * Hapus produk
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await firebaseDb.collection(COLLECTION).doc(id).delete();
  } catch (error: any) {
    throw new Error(error.message || 'Gagal hapus produk');
  }
};

/**
 * Cari produk berdasarkan nama
 */
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

/**
 * Upload gambar produk ke Cloud Storage
 */
export const uploadProductImage = async (
  filePath: string,
  fileName: string
): Promise<string> => {
  try {
    const ref = firebaseStorage.ref(`products/${fileName}`);
    await ref.putFile(filePath);
    const url = await ref.getDownloadURL();
    console.log('Product image uploaded:', url);
    return url;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Gagal upload gambar');
  }
};

/**
 * Subscribe ke perubahan produk real-time
 */
export const onProductsChanged = (
  callback: (products: Product[]) => void,
  onError?: (error: Error) => void
) => {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) return () => {};

  return firebaseDb.collection(COLLECTION)
    .where('userId', '==', currentUser.uid) 
    .onSnapshot(
      (snapshot) => {
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Product));
        callback(products);
      },
      (error) => {
        if (onError) onError(new Error(error.message));
      }
    );
};

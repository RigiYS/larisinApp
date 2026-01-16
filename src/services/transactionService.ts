import { firebaseDb } from './firebase';

export interface Transaction {
  id: string;
  userId: string;
  items: TransactionItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

const COLLECTION = 'transactions';

/**
 * Ambil semua transaksi user
 */
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const snapshot = await firebaseDb
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Transaction));
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil transaksi');
  }
};

/**
 * Ambil satu transaksi
 */
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  try {
    const doc = await firebaseDb.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
    } as Transaction;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil transaksi');
  }
};

/**
 * Tambah transaksi baru
 */
export const addTransaction = async (
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await firebaseDb.collection(COLLECTION).add({
      ...transaction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('Transaction created:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    const errorMsg = error.code === 'permission-denied' 
      ? 'Anda tidak memiliki izin untuk membuat transaksi. Pastikan Firestore sudah dikonfigurasi.'
      : error.message || 'Gagal membuat transaksi';
    throw new Error(errorMsg);
  }
};

/**
 * Update status transaksi
 */
export const updateTransactionStatus = async (
  id: string,
  status: 'pending' | 'completed' | 'cancelled'
): Promise<void> => {
  try {
    await firebaseDb.collection(COLLECTION).doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Gagal update transaksi');
  }
};

/**
 * Hapus transaksi
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await firebaseDb.collection(COLLECTION).doc(id).delete();
  } catch (error: any) {
    throw new Error(error.message || 'Gagal hapus transaksi');
  }
};

/**
 * Hitung total transaksi user dalam periode tertentu
 */
export const getTotalTransactionAmount = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> => {
  try {
    // Get all transactions for user first (no complex index needed)
    const snapshot = await firebaseDb
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .get();
    
    let total = 0;
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      
      // Filter by status
      if (data.status !== 'completed') return;
      
      // Filter by date range
      if (startDate && new Date(data.createdAt) < startDate) return;
      if (endDate && new Date(data.createdAt) > endDate) return;
      
      total += data.totalAmount || 0;
    });
    return total;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal hitung total');
  }
};

/**
 * Subscribe ke transaksi user real-time
 */
export const onUserTransactionsChanged = (
  userId: string,
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
) => {
  return firebaseDb
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .onSnapshot(
      (snapshot) => {
        const transactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Transaction));
        // Sort client-side to avoid composite index requirement
        transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(transactions);
      },
      (error) => {
        if (onError) onError(new Error(error.message || 'Gagal subscribe transaksi'));
      }
    );
};

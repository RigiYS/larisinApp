import { firebaseAuth, firebaseDb } from './firebase';

export interface User {
  uid: string;
  email: string | null;
  name?: string;
}

/**
 * Daftar user baru dengan email dan password
 */
export const signUp = async (email: string, password: string, name: string): Promise<User> => {
  try {
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
      email,
      password
    );
    const uid = userCredential.user.uid;

    // Simpan profil user ke Firestore
    await firebaseDb.collection('users').doc(uid).set({
      uid,
      email,
      name,
      createdAt: new Date().toISOString(),
    });

    return {
      uid,
      email,
      name,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mendaftar');
  }
};

/**
 * Login user dengan email dan password
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;
    return {
      uid: user.uid,
      email: user.email,
      name: user.displayName || undefined,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Gagal login');
  }
};

/**
 * Logout user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseAuth.signOut();
  } catch (error: any) {
    throw new Error(error.message || 'Gagal logout');
  }
};

/**
 * Dapatkan user saat ini
 */
export const getCurrentUser = (): User | null => {
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || undefined,
  };
};

/**
 * Subscribe ke perubahan auth state
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseAuth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || undefined,
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await firebaseAuth.sendPasswordResetEmail(email);
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengirim reset password');
  }
};

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { firebaseAuth, firebaseDb } from '../services/firebase';
import { useNavigation, CommonActions } from '@react-navigation/native';
import theme from '../theme';
import { getProducts } from '../services/productService';
import { getUserTransactions } from '../services/transactionService';

// Mendapatkan lebar layar untuk styling responsif
const { width } = Dimensions.get('window');

interface UserProfile {
  uid: string;
  email: string | null;
  name?: string;
  createdAt?: string;
  phone?: string;
  address?: string;
  photoURL?: string;
}

// --- REUSABLE COMPONENTS ---
const MenuItem = ({ icon, label, onPress, isDanger = false, subLabel = '' }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIconBox, isDanger && styles.menuIconBoxDanger]}>
      <Icon 
          name={icon} 
          size={22} 
          color={isDanger ? theme.colors.danger : theme.colors.primary} 
      />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuLabel, isDanger && styles.textDanger]}>{label}</Text>
      {subLabel ? <Text style={styles.menuSubLabel}>{subLabel}</Text> : null}
    </View>
    <Icon name="chevron-right" size={20} color="#C5C5C5" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  
  const navigation = useNavigation();

  useEffect(() => {
    loadUserProfile();
    loadStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) return;

      const docSnapshot = await firebaseDb.collection('users').doc(user.uid).get();

      if (docSnapshot.exists()) {
        setProfile({
          uid: user.uid,
          email: user.email,
          ...docSnapshot.data(),
        } as UserProfile);
      } else {
        setProfile({
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'Pengguna',
        });
      }
    } catch (error) {
      console.error('Error profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) return;

      const products = await getProducts();
      setProductCount(products.length);

      const transactions = await getUserTransactions(user.uid);
      setTransactionCount(transactions.length);
    } catch (e) {
      console.log('Error stats', e);
    }
  };

  // --- LOGIC LOGOUT UTAMA ---
const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              // CUKUP INI SAJA. App.tsx akan mendeteksi perubahan ini dan pindah halaman otomatis.
              await firebaseAuth.signOut(); 
            } catch (error) {
              Alert.alert('Gagal', 'Terjadi kesalahan saat logout.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarWrapper}>
                {profile?.photoURL ? (
                  <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                     <Text style={styles.avatarInitial}>
                        {profile?.name?.charAt(0).toUpperCase() || 'U'}
                     </Text>
                  </View>
                )}
                <TouchableOpacity style={styles.editBtn}>
                    <Icon name="pencil" size={14} color="#FFF" />
                </TouchableOpacity>
            </View>
            
            <Text style={styles.nameText}>{profile?.name || 'User Tanpa Nama'}</Text>
            <Text style={styles.emailText}>{profile?.email}</Text>
          </View>
        </View>

        {/* OVERLAPPING STATS CARD */}
        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{productCount}</Text>
                <Text style={styles.statLabel}>Total Produk</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{transactionCount}</Text>
                <Text style={styles.statLabel}>Transaksi</Text>
            </View>
        </View>

        {/* ACCOUNT INFO SECTION */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Info Akun</Text>
            <View style={styles.cardContainer}>
                <MenuItem 
                    icon="phone-outline" 
                    label="Nomor Telepon" 
                    subLabel={profile?.phone || 'Belum diatur'} 
                />
                <View style={styles.divider} />
                <MenuItem 
                    icon="map-marker-outline" 
                    label="Alamat Toko" 
                    subLabel={profile?.address || 'Belum diatur'} 
                />
            </View>
        </View>

        {/* SETTINGS SECTION */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pengaturan</Text>
            <View style={styles.cardContainer}>
                <MenuItem icon="cog-outline" label="Edit Profil" />
                <View style={styles.divider} />
                <MenuItem icon="lock-outline" label="Ganti Password" />
                <View style={styles.divider} />
                <MenuItem icon="help-circle-outline" label="Bantuan" />
            </View>
        </View>

        {/* LOGOUT BUTTON */}
        <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Icon name="logout" size={20} color="#FFF" />
                <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>Versi Aplikasi 1.0.0</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  
  // Header Styles
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 40,
    paddingBottom: 60, // Ruang ekstra untuk overlap stats
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  // Stats Styles (Overlapping)
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -40, // Teknik overlap (negatif margin)
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    width: '40%',
  },
  verticalDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },

  // Section Styles
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  
  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primary + '15', // Transparent tint
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIconBoxDanger: {
    backgroundColor: '#FEE2E2',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  menuSubLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  textDanger: {
    color: theme.colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 66, // indent divider to align with text
  },

  // Logout Button Bottom
  logoutContainer: {
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444', // Red 500
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  versionText: {
    marginTop: 20,
    color: '#D1D5DB',
    fontSize: 12,
  },
});
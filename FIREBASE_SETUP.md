# 🔥 Firebase Setup Guide

## Status Setup
- ✅ Packages installed: `@react-native-firebase/*`
- ✅ Services created: auth, firestore, storage, messaging
- ✅ Gradle configured
- ⏳ **Config files needed**

---

## 📥 Download Config Files

### 1. Android: `google-services.json`

1. Buka [Firebase Console](https://console.firebase.google.com/project/larisin-fae8c)
2. Klik ⚙️ **Project Settings**
3. Scroll ke **Your apps** → pilih app Android
4. Klik **Download google-services.json**
5. Taruh file di: `android/app/google-services.json`

**Atau buat app baru:**
- Klik **Add app** → Android
- Package name: `com.larisin`
- Download `google-services.json`

### 2. iOS: `GoogleService-Info.plist`

1. Di Firebase Console → **Project Settings**
2. Pilih app iOS
3. Klik **Download GoogleService-Info.plist**
4. Taruh file di: `ios/larisin/GoogleService-Info.plist`

**Atau buat app baru:**
- Klik **Add app** → iOS
- Bundle ID: `com.larisin`
- Download `GoogleService-Info.plist`

---

## 🔧 Enable Firebase Features

Di [Firebase Console](https://console.firebase.google.com/project/larisin-fae8c):

### 1. Authentication
- **Build → Authentication → Get Started**
- Enable: **Email/Password**
- (Opsional) Enable: Google, Facebook, dll

### 2. Firestore Database
- **Build → Firestore Database → Create database**
- Mode: **Start in test mode** (untuk development)
- Location: pilih terdekat (asia-southeast1 untuk Indonesia)

### 3. Storage
- **Build → Storage → Get Started**
- Mode: **Start in test mode**

### 4. Cloud Messaging (FCM)
- Otomatis aktif saat download config files
- Untuk kirim notif dari server, simpan **Server Key** di:
  - **Project Settings → Cloud Messaging → Server Key**

---

## 📱 Build & Run

### Android
```bash
# Setelah taruh google-services.json
npx react-native run-android
```

### iOS (macOS only)
```bash
# Setelah taruh GoogleService-Info.plist
cd ios
pod install
cd ..
npx react-native run-ios
```

---

## 🧪 Test Firebase

### 1. Test Auth (LoginScreen)
```typescript
// Email: test@example.com
// Password: test123456
```

### 2. Test Firestore (Console)
- Buka Firestore → tambah collection `products`
- Tambah dokumen dengan field:
  ```json
  {
    "name": "Produk Test",
    "price": 10000,
    "stock": 5,
    "image": "https://via.placeholder.com/150"
  }
  ```

### 3. Cek Console Logs
```bash
npx react-native log-android
# atau
npx react-native log-ios
```

---

## 🛠️ Troubleshooting

### Error: "Default FirebaseApp is not initialized"
- Cek `google-services.json` / `GoogleService-Info.plist` ada
- Clean build:
  ```bash
  cd android
  ./gradlew clean
  cd ..
  npx react-native run-android
  ```

### Error: "com.google.gms.google-services plugin not found"
- Pastikan sudah tambah classpath di `android/build.gradle`
- Sync Gradle di Android Studio

### iOS Build Error
- Pastikan `GoogleService-Info.plist` di Xcode project
- Clean build folder: Cmd+Shift+K di Xcode

---

## 📖 Dokumentasi Layanan

### Auth Service
```typescript
import { signUp, signIn, signOut } from './services/authService';

// Register
await signUp('email@example.com', 'password', 'Nama User');

// Login
const user = await signIn('email@example.com', 'password');

// Logout
await signOut();
```

### Product Service
```typescript
import { getProducts, addProduct } from './services/productService';

// Get all products
const products = await getProducts();

// Add product
await addProduct({
  name: 'Produk Baru',
  price: 50000,
  stock: 10
});
```

### Transaction Service
```typescript
import { getUserTransactions, addTransaction } from './services/transactionService';

// Get user transactions
const transactions = await getUserTransactions(userId);

// Create transaction
await addTransaction({
  userId: 'user-id',
  items: [...],
  totalAmount: 100000,
  status: 'completed'
});
```

### Notification Service
```typescript
import { initializeNotifications } from './services/notificationService';

// Initialize (di App.tsx)
await initializeNotifications((notification) => {
  console.log('Notif:', notification.title);
});
```

---

## 🔐 Security Rules (Production)

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users dapat baca/tulis data sendiri
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products: semua bisa baca, hanya auth user bisa tulis
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Transactions: hanya pemilik bisa akses
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{filename} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📞 Project Info
- **Project ID:** larisin-fae8c
- **Console:** https://console.firebase.google.com/project/larisin-fae8c

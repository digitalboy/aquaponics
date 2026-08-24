/**
 * =========================================================================
 * ElecPal (电气伴侣) · Firebase SDK 初始化与云端配置
 * 支持 Google OAuth 免密认证与 Cloud Firestore 实时持久化
 * 支持缺少云端密钥时自动平滑回退至 LocalStorage 离线单机沙盒
 * =========================================================================
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyBNubXGVv6aHykbdFsB4kR0BNDZkoyCewI',
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'beike-e6301.firebaseapp.com',
  databaseURL: import.meta.env?.VITE_FIREBASE_DATABASE_URL || 'https://beike-e6301-default-rtdb.firebaseio.com',
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'beike-e6301',
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 'beike-e6301.firebasestorage.app',
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '889627047453',
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || '1:889627047453:web:f4f27acf754f8cff05b8f4',
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || 'G-B92HLJ8J15'
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
export const googleProvider = new GoogleAuthProvider();

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.warn('【ElecPal】Firebase 初始化未就绪，系统自动切换为 LocalStorage 本地沙盒模式。', err);
}

export { app, auth, db };

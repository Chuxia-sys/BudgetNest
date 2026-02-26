import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Validate Firebase configuration
const validateFirebaseConfig = (): boolean => {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  const missing = requiredKeys.filter(
    key => !process.env[key] || 
    process.env[key]?.includes('demo') || 
    process.env[key]?.includes('your_')
  );
  
  if (missing.length > 0) {
    console.warn('⚠️ Firebase configuration incomplete or using defaults:', missing);
    console.warn('Update .env.local with actual Firebase credentials');
    console.warn('Get them from: https://console.firebase.google.com/ → Project Settings');
    return false;
  }

  return true;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

try {
  // Initialize or get existing app
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  console.log('✅ Firebase initialized successfully');
  
  // Validate configuration
  if (validateFirebaseConfig()) {
    console.log('✅ Firebase configuration is valid');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase. Check your configuration in .env.local');
}

// Initialize Analytics (browser only, lazy loaded)
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
      } else {
        console.log('ℹ️ Analytics not supported in this environment');
      }
    })
    .catch((error) => {
      console.log('ℹ️ Analytics initialization skipped:', error.message);
    });
}

export { app, auth, db, storage, analytics };

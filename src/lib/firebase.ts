import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Check if Firebase config is available
const isFirebaseConfigAvailable = (): boolean => {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  return requiredKeys.every(
    key => process.env[key] && 
    !process.env[key]?.includes('demo') && 
    !process.env[key]?.includes('your_')
  );
};

// Firebase configuration
const getFirebaseConfig = () => {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'demo',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };
};

// Lazy initialization of Firebase services
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let initializationAttempted = false;
let initializationError: Error | null = null;

const initializeFirebase = (): void => {
  if (initializationAttempted) {
    if (initializationError) {
      throw initializationError;
    }
    return;
  }

  initializationAttempted = true;

  try {
    if (!isFirebaseConfigAvailable()) {
      console.warn(
        '⚠️ Firebase configuration incomplete. Using placeholder values for build time.\n' +
        'Please add your Firebase credentials to .env.local:\n' +
        'NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key\n' +
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain\n' +
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id\n' +
        'And other required Firebase env vars.\n' +
        'Get them from: https://console.firebase.google.com/ → Project Settings'
      );
      return;
    }

    const firebaseConfig = getFirebaseConfig();

    // Initialize or get existing app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    console.log('✅ Firebase initialized successfully');

    // Initialize Analytics (browser only, lazy loaded)
    if (typeof window !== 'undefined') {
      isSupported()
        .then((supported) => {
          if (supported && app) {
            analytics = getAnalytics(app);
            console.log('✅ Firebase Analytics initialized');
          }
        })
        .catch((error) => {
          console.log('ℹ️ Analytics initialization skipped:', error.message);
        });
    }
  } catch (error) {
    initializationError = error instanceof Error 
      ? error 
      : new Error('Failed to initialize Firebase');
    console.error('❌ Firebase initialization error:', initializationError);
    // Don't throw during build time, just log the warning
    if (typeof window === 'undefined') {
      console.warn('⚠️ Firebase will not be available during build time');
    } else {
      throw initializationError;
    }
  }
};

// Getters that initialize on first use
const getApp_Instance = (): FirebaseApp => {
  initializeFirebase();
  if (!app) {
    throw new Error('Firebase app not initialized. Check your configuration.');
  }
  return app;
};

const getAuth_Instance = (): Auth => {
  initializeFirebase();
  if (!auth) {
    throw new Error('Firebase auth not initialized. Check your configuration.');
  }
  return auth;
};

const getDb_Instance = (): Firestore => {
  initializeFirebase();
  if (!db) {
    throw new Error('Firebase Firestore not initialized. Check your configuration.');
  }
  return db;
};

const getStorage_Instance = (): FirebaseStorage => {
  initializeFirebase();
  if (!storage) {
    throw new Error('Firebase Storage not initialized. Check your configuration.');
  }
  return storage;
};

const getAnalytics_Instance = (): Analytics | null => {
  if (typeof window === 'undefined') return null;
  initializeFirebase();
  return analytics;
};

export {
  getApp_Instance as app,
  getAuth_Instance as auth,
  getDb_Instance as db,
  getStorage_Instance as storage,
  getAnalytics_Instance as analytics,
  isFirebaseConfigAvailable
};

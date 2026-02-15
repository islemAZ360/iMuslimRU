import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBE4TNirs91UjnowQfy_Z-lPkfka2PaBTo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "imuslim-ed870.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "imuslim-ed870",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "imuslim-ed870.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "710978877912",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:710978877912:web:9be62b46dd027b1b5edaad",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KSX2B0T81W"
};

// Initialize Firebase (prevent duplicate initialization)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;
let analytics: Analytics | null = null;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();

  // Analytics only works in browser environment
  if (typeof window !== 'undefined') {
    import('firebase/analytics').then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
    }).catch(err => console.error('Analytics init failed:', err));
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Provide mock objects so specific imports don't crash the build
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  googleProvider = new GoogleAuthProvider();
}

export { auth, db, googleProvider, analytics };
export default app;

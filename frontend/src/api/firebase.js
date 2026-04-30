import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD_SJv9B9YwOC_ePAFWvMK0pzwFh8sCvzQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'aura-health-1e8d3.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'aura-health-1e8d3',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'aura-health-1e8d3.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '288309000259',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:288309000259:web:08887b6f3db4d88beafcf6',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-LVF9TW6H1R',
};

const requiredFirebaseKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingFirebaseEnv = requiredFirebaseKeys.filter(
  (key) => !firebaseConfig[key]
);

if (missingFirebaseEnv.length > 0) {
  console.error(
    '[Firebase] Missing frontend env variables:',
    missingFirebaseEnv.join(', ')
  );
}

const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const firebaseProjectInfo = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
};

export default app;
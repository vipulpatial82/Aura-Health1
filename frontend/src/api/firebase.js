import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDmHJj5J-bCR2yquRtk0V-Va9oQFdDZoj8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aura-health-c342d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aura-health-c342d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aura-health-c342d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "509649709979",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:509649709979:web:6aa27cfb1c9f951fc3cf3e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;
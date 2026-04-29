import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT from environment:', e);
    }
  } else {
    try {
      const filePath = path.join(__dirname, '../config/firebase-service-account.json');
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        credential = admin.credential.cert(JSON.parse(fileData));
      }
    } catch (e) {
      console.error('Failed to load local firebase-service-account.json:', e);
    }
  }

  if (credential) {
    admin.initializeApp({ credential });
  } else {
    console.warn('Initializing Firebase Admin without explicit credentials');
    admin.initializeApp();
  }
}

export const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw error;
  }
};

export default admin;
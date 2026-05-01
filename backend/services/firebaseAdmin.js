import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env variable is not set');

    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log('[Firebase Admin] Initialized with service account for project:', serviceAccount.project_id);
  } catch (e) {
    console.error('[Firebase Admin] Failed to initialize:', e.message);
  }
}

export const verifyFirebaseToken = async (idToken) => {
  if (!admin.apps.length) throw new Error('Firebase Admin not initialized');
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    throw error;
  }
};

export default admin;

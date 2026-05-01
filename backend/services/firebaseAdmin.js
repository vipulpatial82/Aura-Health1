import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      console.error('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT env variable is not set');
    } else {
      // Replace escaped newlines in private key
      const cleaned = raw.replace(/\\n/g, '\n');
      const serviceAccount = JSON.parse(cleaned);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      console.log('[Firebase Admin] Initialized for project:', serviceAccount.project_id);
    }
  } catch (e) {
    console.error('[Firebase Admin] Init failed:', e.message);
  }
}

export const verifyFirebaseToken = async (idToken) => {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized — check FIREBASE_SERVICE_ACCOUNT env variable');
  }
  return await admin.auth().verifyIdToken(idToken);
};

export default admin;

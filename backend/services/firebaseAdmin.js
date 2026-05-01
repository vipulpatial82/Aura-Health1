import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT not set');

    // Fix private key — Render sometimes converts \n to literal newlines breaking JSON
    const fixed = raw
      .replace(/\\\\n/g, '\\n')   // double-escaped
      .replace(/\r\n/g, '\\n')    // Windows CRLF
      .replace(/\r/g, '\\n');     // CR only

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(fixed);
    } catch {
      // If still failing, extract and fix just the private key
      const keyMatch = raw.match(/"private_key"\s*:\s*"([\s\S]*?)(?<!\\)"/);
      if (keyMatch) {
        const fixedKey = keyMatch[1].replace(/\n/g, '\\n');
        const reFixed = raw.replace(keyMatch[0], `"private_key":"${fixedKey}"`);
        serviceAccount = JSON.parse(reFixed);
      } else {
        throw new Error('Cannot parse service account JSON');
      }
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log('[Firebase Admin] Initialized for project:', serviceAccount.project_id);
  } catch (e) {
    console.error('[Firebase Admin] Init failed:', e.message);
  }
}

export const verifyFirebaseToken = async (idToken) => {
  if (!admin.apps.length) throw new Error('Firebase Admin not initialized');
  return await admin.auth().verifyIdToken(idToken);
};

export default admin;

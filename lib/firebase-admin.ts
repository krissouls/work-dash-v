import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
// Requires FIREBASE_SERVICE_ACCOUNT_JSON in environment variables
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "{}"
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

export const db = admin.database();
export const auth = admin.auth();
export default admin;

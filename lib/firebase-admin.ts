import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK — used exclusively in server-side API routes.
 *
 * The client SDK cannot write to Firestore from API routes because
 * there is no authenticated user context on the server, and Firestore
 * security rules block unauthenticated writes. The Admin SDK bypasses
 * rules entirely, making it the correct choice for server-side mutations
 * like visitor tracking.
 *
 * Credentials are loaded from a FIREBASE_SERVICE_ACCOUNT_KEY env var
 * containing the full JSON service account key (base64-encoded or raw).
 * Falls back to application default credentials (works on GCP/Firebase hosting).
 */

let adminApp: App;
let adminDb: Firestore;
let adminConfigured = false;

function getServiceAccount(): object | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  try {
    // Try parsing as raw JSON first
    return JSON.parse(raw);
  } catch {
    try {
      // Try base64-decoded JSON
      return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
    } catch {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
      return null;
    }
  }
}

try {
  if (getApps().length === 0) {
    const serviceAccount = getServiceAccount();

    if (serviceAccount) {
      adminApp = initializeApp({
        credential: cert(serviceAccount as any),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      adminConfigured = true;
    } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      // Fallback: try application default credentials (works on GCP)
      // For local dev without service account, use projectId only
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      adminConfigured = true;
    }
  } else {
    adminApp = getApps()[0];
    adminConfigured = true;
  }

  if (adminConfigured) {
    adminDb = getFirestore(adminApp!);
  }
} catch (err) {
  console.error("Firebase Admin initialization failed:", err);
  adminConfigured = false;
}

export { adminDb, adminConfigured };

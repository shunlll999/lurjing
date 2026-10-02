import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  type Firestore,
} from "firebase/firestore";

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

function cleanEnv(value?: string) {
  return value
    ?.trim()
    .replace(/^[\s"'`]+|[\s"',`]+$/g, "")
    .trim();
}

function getFirebaseConfig(): FirebaseOptions {
  return {
    apiKey: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    ),
    authDomain: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    ),
    projectId: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ),
    storageBucket: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    ),
    messagingSenderId: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    ),
    appId: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    ),
    measurementId: cleanEnv(
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    ),
  };
}

function assertFirebaseConfig(config: FirebaseOptions) {
  const required = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", config.apiKey],
    [
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      config.authDomain,
    ],
    [
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      config.projectId,
    ],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", config.appId],
  ] as const;

  const missing = required
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(
      `Firebase config missing: ${missing.join(", ")}`,
    );
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;

  const config = getFirebaseConfig();
  assertFirebaseConfig(config);

  appInstance = getApps().length
    ? getApp()
    : initializeApp(config);

  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;

  authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (firestoreInstance) return firestoreInstance;

  firestoreInstance = getFirestore(getFirebaseApp());
  return firestoreInstance;
}

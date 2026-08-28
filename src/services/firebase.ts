import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  serverTimestamp,
  onSnapshot,
  query,
  where,
  deleteDoc
} from "firebase/firestore";
import appletConfig from "../../firebase-applet-config.json";

const metaEnv = ((import.meta as unknown) as { env?: Record<string, string> }).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "",
  appId: metaEnv.VITE_FIREBASE_APP_ID || appletConfig.appId || ""
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "votre_cle_api_firebase_ici" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "votre_projet_firebase_id"
);

export const app = isFirebaseConfigured 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

export const auth = app ? getAuth(app) : null;
export const firestoreDatabaseId = appletConfig.firestoreDatabaseId || "(default)";
export const db = app ? (firestoreDatabaseId && firestoreDatabaseId !== "(default)" ? getFirestore(app, firestoreDatabaseId) : getFirestore(app)) : null;

// Firebase Authentication Helpers
export async function loginWithFirebase(email: string, pass: string): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  if (!auth) {
    return { success: false, error: "Firebase Authentication non configuré. Veuillez définir les variables VITE_FIREBASE_* dans votre environnement." };
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, user: userCredential.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la connexion Firebase";
    return { success: false, error: message };
  }
}

export async function registerWithFirebase(email: string, pass: string): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  if (!auth) {
    return { success: false, error: "Firebase Authentication non configuré." };
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    return { success: true, user: userCredential.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'inscription Firebase";
    return { success: false, error: message };
  }
}

/**
 * Creates a secondary user in Firebase Auth without disrupting the current user's session
 */
export async function registerSecondaryUserWithFirebase(
  email: string, 
  pass: string
): Promise<{ success: boolean; uid?: string; error?: string }> {
  if (!isFirebaseConfigured) {
    return { success: true };
  }
  try {
    const secondaryAppName = `SecondaryApp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    const uid = userCredential.user.uid;
    await firebaseSignOut(secondaryAuth);
    return { success: true, uid };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la création du compte Firebase";
    return { success: false, error: message };
  }
}

export async function logoutWithFirebase(): Promise<void> {
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export async function sendPasswordResetEmailToUser(email: string): Promise<{ success: boolean; error?: string }> {
  if (!auth) {
    return { success: false, error: "Firebase Authentication non configuré." };
  }
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'envoi de réinitialisation";
    return { success: false, error: message };
  }
}

// Firestore Data Helpers
export async function syncCollectionToFirestore<T extends { id: string }>(collectionName: string, data: T[]): Promise<boolean> {
  if (!db) return false;
  try {
    for (const item of data) {
      await setDoc(doc(db, collectionName, item.id), {
        ...item,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    return true;
  } catch (err) {
    console.error(`Erreur de synchronisation Firestore pour ${collectionName}:`, err);
    return false;
  }
}

export async function fetchCollectionFromFirestore<T>(collectionName: string): Promise<T[]> {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items: T[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as T);
    });
    return items;
  } catch (err) {
    console.error(`Erreur de lecture Firestore pour ${collectionName}:`, err);
    return [];
  }
}

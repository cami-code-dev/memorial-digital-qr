import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { environment } from '../environments/environment';

const firebaseConfig = environment.firebase;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

export function initializeFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore; storage: FirebaseStorage } {
  if (!app) {
    app = initializeApp(firebaseConfig);

    auth = getAuth(app);
    auth.useDeviceLanguage();

    db = getFirestore(app);

    storage = getStorage(app);
  }

  return { app, auth, db, storage };
}

export function getFirebaseAuth(): Auth {
  if (!auth) initializeFirebase();
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) initializeFirebase();
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) initializeFirebase();
  return storage;
}

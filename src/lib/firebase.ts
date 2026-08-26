import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Inisialisasi Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inisialisasi Firestore dengan Database ID yang diprovisikan khusus
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default app;

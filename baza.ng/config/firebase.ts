import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCTnuDeEvcCZ4y_O4lYj623MNSx-j7dOCU",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "baza-c408e.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "baza-c408e",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "baza-c408e.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "30504101922",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    "1:30504101922:android:c240cfa59260afa690427b",
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();

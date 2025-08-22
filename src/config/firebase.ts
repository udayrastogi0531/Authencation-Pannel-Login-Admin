// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_wq8nuMMWKIMMQD5yUSLLlmETF6XstKU",
  authDomain: "authentication-panel-login.firebaseapp.com",
  projectId: "authentication-panel-login",
  storageBucket: "authentication-panel-login.firebasestorage.app",
  messagingSenderId: "172289668742",
  appId: "1:172289668742:web:f4517d3c2f17c558010307",
  measurementId: "G-H321R6TLD6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app;

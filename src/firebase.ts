import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAHq5Tvn3qZvbj1D2GJdUW-BhPWiAURBJI",
  authDomain: "patentes-51d85.firebaseapp.com",
  projectId: "patentes-51d85",
  storageBucket: "patentes-51d85.firebasestorage.app",
  messagingSenderId: "278792677855",
  appId: "1:278792677855:web:1e1583b1a3b8cdd140e6a5",
  measurementId: "G-GPH8EYLKFP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
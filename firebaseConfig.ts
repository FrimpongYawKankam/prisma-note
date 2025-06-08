// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAwF-gGWk3ePP0oiL35UwybnN7Ble7iMVY",
  authDomain: "prisma-note.firebaseapp.com",
  projectId: "prisma-note",
  storageBucket: "prisma-note.firebasestorage.app",
  messagingSenderId: "105342935662",
  appId: "1:105342935662:web:551c1308303b32c1b13c7f",
  measurementId: "G-6X59CJ58M8" 
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

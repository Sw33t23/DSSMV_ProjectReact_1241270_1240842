import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAe32bC1a0YOHg3Aokhgafq7E6wiy1_eK0",
  authDomain: "moviewatchlistapp-52230.firebaseapp.com",
  databaseURL: "YOUR_DB_URL",
  projectId: "moviewatchlistapp-52230",
  storageBucket: "moviewatchlistapp-52230.firebasestorage.app",
  messagingSenderId: "737081148861",
  appId: "1:737081148861:web:9444c4187b9029ecf97ed4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

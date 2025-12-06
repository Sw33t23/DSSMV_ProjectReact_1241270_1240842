import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAe32bC1a0YO ...", // keep your actual key
  authDomain: "moviewatchlistapp-52230.firebaseapp.com",
  projectId: "moviewatchlistapp-52230",
  storageBucket: "moviewatchlistapp-52230.appspot.com",
  messagingSenderId: "737081148861",
  appId: "1:737081148861:web:9444c4187b9029ecf97ed4",
};

const app = initializeApp(firebaseConfig);

// React Native Auth initialization
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

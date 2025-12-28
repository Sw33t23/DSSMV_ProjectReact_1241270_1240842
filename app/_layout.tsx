import { Slot, Stack, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase'; 
import { useAppStore } from '../store/useAppStore'; 

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function LayoutController() {
  // Extract user state, loading status, and the actions from Zustand
  // 👇 ADDED 'loadUserData' to the destructuring
  const { user, isLoadingAuth, setFirebaseUser, loadUserData } = useAppStore();

  const [initialRouteChecked, setInitialRouteChecked] = useState(false);

  useEffect(() => {
    // The Firebase listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. Update the user globally in Zustand
      setFirebaseUser(firebaseUser); 

      // 2. 👇 NEW: If a user is found, download their persistent data from Firestore
      if (firebaseUser) {
        await loadUserData(firebaseUser.uid);
      }

      setInitialRouteChecked(true);
      SplashScreen.hideAsync();
    });
    
    return () => unsubscribe();
  }, [setFirebaseUser, loadUserData]); // Added dependencies

  // Show nothing while checking initial auth status
  if (isLoadingAuth || !initialRouteChecked) {
    return null;
  }
  
  // LOGGED OUT: Render the Auth Stack 
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" /> 
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} /> 
        <Stack.Screen name="index" /> 
      </Stack>
    );
  }

  // LOGGED IN: Render the Slot
  return <Slot />;
}

export default function RootLayout() {
    return <LayoutController />;
}
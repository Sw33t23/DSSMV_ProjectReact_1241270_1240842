import { Slot, Stack, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase'; 
// 👇 IMPORT ZUSTAND HOOK
import { useAppStore } from '../store/useAppStore'; 

// Prevent the splash screen from auto-hiding before we fetch the auth status
SplashScreen.preventAutoHideAsync();

// This component is the only one rendered at the top level
function LayoutController() {
  // 👇 1. REPLACE LOCAL STATE WITH GLOBAL ZUSTAND STATE
  // We extract the user state, loading status, and the action to set the user
  const { user, isLoadingAuth, setFirebaseUser } = useAppStore();

  // We only need local state to manage the SplashScreen visibility logic
  const [initialRouteChecked, setInitialRouteChecked] = useState(false);

  useEffect(() => {
    // 2. The Firebase listener calls the Zustand action to update global state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Call the Zustand action to update the user globally
      setFirebaseUser(firebaseUser); 
      setInitialRouteChecked(true);
      SplashScreen.hideAsync();
    });
    
    // The dependency array includes the Zustand action
    return () => unsubscribe();
  }, [setFirebaseUser]); 

  // 3. Use the Zustand loading status instead of local state
  // Show nothing while checking initial auth status
  if (isLoadingAuth || !initialRouteChecked) {
    return null;
  }
  
  // LOGGED OUT: Render the Auth Stack 
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* Only the auth group is available when logged out */}
        <Stack.Screen name="auth" /> 
        
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} /> 
        
        {/* index.tsx should redirect to 'auth' if it exists */}
        <Stack.Screen name="index" /> 
      </Stack>
    );
  }

  // LOGGED IN: Render the Slot, which renders the rest of the file system routes
  return (
    <Slot />
  );
}

// Export the component that renders the controller
export default function RootLayout() {
    // NO PROVIDER WRAPPER IS NEEDED for Zustand!
    return <LayoutController />;
}
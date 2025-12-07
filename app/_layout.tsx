import { Slot, Stack, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase'; // Adjust path if needed

// Prevent the splash screen from auto-hiding before we fetch the auth status
SplashScreen.preventAutoHideAsync();

// This component is the only one rendered at the top level
function LayoutController() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [initialRouteChecked, setInitialRouteChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitialRouteChecked(true);
      SplashScreen.hideAsync();
    });
    return () => unsubscribe();
  }, []);

  // Show nothing while checking initial auth status
  if (!initialRouteChecked) {
    return null;
  }
  
  // LOGGED OUT: Render the Auth Stack (which contains login and signup)
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* Only the auth group is available when logged out */}
        <Stack.Screen name="auth" /> 
        
        {/* We keep modal outside the auth flow so it can be navigated to from the index redirect */}
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
    return <LayoutController />;
}
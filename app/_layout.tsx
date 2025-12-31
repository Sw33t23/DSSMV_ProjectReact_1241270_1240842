import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router'; // 👈 Added useRouter & useSegments
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase'; 
import { useAppStore } from '../store/useAppStore'; 

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, isLoadingAuth, setFirebaseUser, loadUserData } = useAppStore();
  const [appReady, setAppReady] = useState(false);
  
  const router = useRouter();
  const segments = useSegments(); // 👈 This tells us which folder we are in

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser); 
      if (firebaseUser) {
        await loadUserData(firebaseUser.uid);
      } else {
        useAppStore.setState({ watchlist: [], viewed: [], ratings: {} });
      }
      setAppReady(true);
      SplashScreen.hideAsync();
    });
    return () => unsubscribe();
  }, []);

  // 🚪 NEW: The Force-Redirect Effect
  useEffect(() => {
    if (!appReady) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // If no user and NOT in the login screens, force them to login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // If user exists but stuck in login screens, send to tabs
      router.replace('/(tabs)');
    }
  }, [user, segments, appReady]);

  if (!appReady || isLoadingAuth) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="movie/[id]" options={{ headerShown: true, title: 'Movie Details' }} />
        </>
      ) : (
        <Stack.Screen name="auth" />
      )}
    </Stack>
  );
}
import { Slot, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);         
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return null; // splash screen or loader

  if (!user) return <Redirect href="/auth/login" />;

  return <Slot />;
}

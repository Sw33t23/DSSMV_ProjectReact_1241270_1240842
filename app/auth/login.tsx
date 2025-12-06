import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { Link } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      console.log("Login error:", e);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text>Email</Text>
      <TextInput onChangeText={setEmail} style={{ borderWidth: 1 }} />

      <Text>Password</Text>
      <TextInput secureTextEntry onChangeText={setPassword} style={{ borderWidth: 1 }} />

      <Button title="Login" onPress={handleLogin} />

      <Link href="/auth/signup">Create account</Link>
    </View>
  );
}

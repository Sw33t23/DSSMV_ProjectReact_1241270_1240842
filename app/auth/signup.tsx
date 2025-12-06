import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { Link } from "expo-router";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      console.log("Signup error:", e);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text>Email</Text>
      <TextInput onChangeText={setEmail} style={{ borderWidth: 1 }} />

      <Text>Password</Text>
      <TextInput secureTextEntry onChangeText={setPassword} style={{ borderWidth: 1 }} />

      <Button title="Sign Up" onPress={handleSignup} />

      <Link href="/auth/login">Already have an account?</Link>
    </View>
  );
}

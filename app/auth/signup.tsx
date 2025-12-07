import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, // Added Alert for feedback
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { auth } from "../../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";

// This component is exported as default, which is REQUIRED by Expo Router
export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      // 1. Attempt to create the user
      await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. If successful, replace the current screen with the main app tabs
      router.replace("/(tabs)");
      
    } catch (error) {
      // 3. Handle any authentication errors (e.g., password too weak, email already in use)
      console.error("Signup Error:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/weak-password') {
        errorMessage = "The password must be at least 6 characters long.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      }
      
      Alert.alert("Signup Failed", errorMessage);
    } finally {
      // 4. Stop loading indicator
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput 
          style={styles.input}
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput 
          style={styles.input}
          placeholder="Password" 
          secureTextEntry 
          value={password} 
          onChangeText={setPassword} 
        />
        
        <Button 
          title={loading ? "Creating..." : "Create Account"} 
          onPress={handleSignup} 
          disabled={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 30,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
});
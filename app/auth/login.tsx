import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
// Import Link from expo-router to navigate to the signup screen
import { router, Link } from "expo-router"; 
import { auth } from "../../firebase/firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";

// Exported as default, which is REQUIRED by Expo Router
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      // 1. Attempt to sign in
      await signInWithEmailAndPassword(auth, email, password);
      
      // 2. If successful, navigate to the main app tabs
      router.replace("/(tabs)");
      
    } catch (error) {
      // 3. Handle any authentication errors
      console.error("Login Error:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      }
      
      Alert.alert("Login Failed", errorMessage);
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
        <Text style={styles.title}>Login</Text>
        
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
        
        {/* Login Button */}
        <Button 
          title={loading ? "Logging In..." : "Login"} 
          onPress={handleLogin} 
          disabled={loading}
        />

        {/* Link to Signup Screen */}
        <Link href="/auth/signup" asChild>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </Link>
        
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
  // New style for the link
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: '600',
  }
});
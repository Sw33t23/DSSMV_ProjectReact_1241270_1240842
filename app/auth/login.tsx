import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity
} from "react-native";
import { router, Link } from "expo-router"; 
import { auth } from "../../firebase/firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";

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
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMessage = "An unexpected error occurred.";
      if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      }
      Alert.alert("Login Failed", errorMessage);
    } finally {
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
          placeholderTextColor="#888" // 👈 FIXED: Hint text color
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput 
          style={styles.input}
          placeholder="Password" 
          placeholderTextColor="#888" // 👈 FIXED: Hint text color
          secureTextEntry 
          value={password} 
          onChangeText={setPassword} 
        />
        
        <Button 
          title={loading ? "Logging In..." : "Login"} 
          onPress={handleLogin} 
          disabled={loading}
          color="#007AFF"
        />

        <Link href="/auth/signup" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333', // Dark title for contrast
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#333', // 👈 FIXED: Typed text color
    backgroundColor: '#fff',
  },
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: '600',
  }
});
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
  TouchableOpacity // 👈 ADDED
} from "react-native";
import { auth } from "../../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { router, Link } from "expo-router"; // 👈 ADDED Link

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
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Signup Error:", error);
      
      let errorMessage = "An unexpected error occurred.";
      if (error.code === 'auth/weak-password') {
        errorMessage = "The password must be at least 6 characters long.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      }
      
      Alert.alert("Signup Failed", errorMessage);
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
        <Text style={styles.title}>Create Account</Text>
        
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
          title={loading ? "Creating..." : "Create Account"} 
          onPress={handleSignup} 
          disabled={loading}
          color="#007AFF"
        />

        {/* Link back to Login */}
        <Link href="/auth/login" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Already have an account? Login</Text>
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
    color: '#333',
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
import { Redirect } from "expo-router";
import { useAppStore } from "../store/useAppStore";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const { user, isLoadingAuth } = useAppStore();

  // 1. Show a loading spinner while Firebase is checking the session
  if (isLoadingAuth) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  // 2. If the user is logged in, send them to the main app (Tabs)
  // 3. If NOT logged in, send them to the login screen
  return user ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/auth/login" />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
});
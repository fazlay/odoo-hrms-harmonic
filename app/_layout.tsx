// app/_layout.tsx
import { Stack } from "expo-router";
import { OdooProvider, useOdoo } from "@/context/OdooContext";
import LoginScreen from "@/components/LoginScreen";
import { ActivityIndicator, View, StyleSheet } from "react-native";

function AppContent() {
  const { isConfigured, isLoading } = useOdoo();

  // Show loading spinner while checking config
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show login screen if not configured
  if (!isConfigured) {
    return <LoginScreen />;
  }

  // Show main app if configured
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <OdooProvider>
      <AppContent />
    </OdooProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
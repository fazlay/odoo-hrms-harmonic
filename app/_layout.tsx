import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { OdooProvider } from "@/context/OdooContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
// import { OdooProvider } from "@/context/OdooContext";

import "react-native-reanimated";
// import { OdooProvider } from "../context/OdooContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <OdooProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </OdooProvider>
    </ThemeProvider>
  );
}

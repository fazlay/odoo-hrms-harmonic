// app/(tabs)/index.tsx
import { format } from "date-fns";
import { Image } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useOdoo } from "@/context/OdooContext";
import { useCompanies } from "@/hooks/usePartners";
import { attendanceService } from "@/services/attendance.service";

export default function HomeScreen() {
  const { logout, uid, client } = useOdoo();

  // ✅ Use the hook that automatically fetches from the authenticated client
  const { partners, isLoading, error } = useCompanies(5);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const createAttendance = async (client: any) => {
    try {
      const newAttendanceId = await attendanceService.createAttendance(client, {
        employee_id: 910, // Replace with actual employee ID
        // time date format should be like this '%Y-%m-%d %H:%M:%S'
        check_in: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      });
      console.log("New attendance record created with ID:", newAttendanceId);
    } catch (error) {
      console.error("Error creating attendance record:", error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      {/* User Info & Logout */}
      <ThemedView style={styles.userInfoContainer}>
        <ThemedView style={styles.userInfo}>
          <ThemedText style={styles.userText}>👤 User ID: {uid}</ThemedText>
        </ThemedView>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>🚪 Logout</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      {/* PUNCH IN */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => createAttendance(client)}
      >
        <ThemedText style={styles.logoutText}>PUNCH IN</ThemedText>
      </TouchableOpacity>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">
          Company Partners ({partners.length})
        </ThemedText>

        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : error ? (
          <ThemedText style={styles.error}>Error: {error}</ThemedText>
        ) : (
          <ThemedView>
            {partners.map((partner, index) => (
              <ThemedView key={partner.id} style={styles.partnerCard}>
                <ThemedText style={styles.partnerName}>
                  {index + 1}. {partner.name}
                </ThemedText>
                {partner.email && (
                  <ThemedText style={styles.partnerEmail}>
                    {partner.email}
                  </ThemedText>
                )}
              </ThemedView>
            ))}
            {partners.length === 0 && (
              <ThemedText style={styles.empty}>No partners found</ThemedText>
            )}
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  userInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 8,
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userText: {
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#ff3b30",
    borderRadius: 6,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    marginTop: 20,
    gap: 12,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    color: "red",
    padding: 16,
  },
  empty: {
    textAlign: "center",
    padding: 20,
    opacity: 0.5,
  },
  partnerCard: {
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  partnerEmail: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
});

import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import OdooClient from "@/utils/OdooClient";

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize and authenticate
      const odoo = new OdooClient({
        url: "http://192.168.0.105:8018",
        db: "backup_payroll",
        username: "admin@jamunagas.com",
        password: "demo",
      });

      await odoo.authenticate();

      // Fetch partners
      const data = await odoo.searchRead(
        "res.partner",
        [["is_company", "=", true]],
        ["name", "email"],
        50
      );

      setPartners(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error("❌ Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPartner = ({ item, index }: { item: any; index: number }) => (
    <ThemedView style={styles.partnerCard}>
      <ThemedText style={styles.partnerName}>
        {index + 1}. {item.name}
      </ThemedText>
      {item.email && (
        <ThemedText style={styles.partnerEmail}>{item.email}</ThemedText>
      )}
    </ThemedView>
  );

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
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">Company Partners</ThemedText>

        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : error ? (
          <ThemedText style={styles.error}>Error: {error}</ThemedText>
        ) : (
          <FlatList
            data={partners}
            renderItem={renderPartner}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <ThemedText style={styles.empty}>No partners found</ThemedText>
            }
          />
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
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
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

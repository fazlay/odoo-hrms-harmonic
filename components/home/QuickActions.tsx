// components/home/QuickActions.tsx
// Quick action buttons grid for common tasks

import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  onAddTimesheet?: () => void;
}

export function QuickActions({ onAddTimesheet }: QuickActionsProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const actions: QuickAction[] = [
    {
      icon: "add-circle",
      label: "Log Time",
      color: theme.primary,
      onPress: () => onAddTimesheet?.(),
    },
    {
      icon: "list",
      label: "Timesheets",
      color: theme.success,
      onPress: () => router.push("/(tabs)/timesheets" as Href),
    },
    {
      icon: "stats-chart",
      label: "Reports",
      color: theme.warning,
      onPress: () => {}, // Future feature
    },
    {
      icon: "settings",
      label: "Settings",
      color: "#9333EA",
      onPress: () => {}, // Future feature
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <ThemedText style={styles.title}>Quick Actions</ThemedText>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${action.color}15` },
              ]}
            >
              <Ionicons name={action.icon} size={28} color={action.color} />
            </View>
            <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});

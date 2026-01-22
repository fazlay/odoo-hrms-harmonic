// components/home/HoursProgressCard.tsx
// Shows today and weekly hours progress with visual progress bars

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTimesheetSummary } from "@/hooks/useTimesheet";

interface ProgressBarProps {
  progress: number;
  color: string;
  backgroundColor: string;
}

function ProgressBar({ progress, color, backgroundColor }: ProgressBarProps) {
  return (
    <View style={[progressStyles.container, { backgroundColor }]}>
      <View
        style={[
          progressStyles.fill,
          {
            width: `${Math.min(progress * 100, 100)}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  container: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});

export function HoursProgressCard({
  refreshTrigger,
}: {
  refreshTrigger?: number;
}) {
  const { todayHours, weekHours, isLoading } =
    useTimesheetSummary(refreshTrigger);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const DAILY_TARGET = 8;
  const WEEKLY_TARGET = 40;

  const todayProgress = todayHours / DAILY_TARGET;
  const weekProgress = weekHours / WEEKLY_TARGET;

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
          <ThemedText style={[styles.loadingText, { color: theme.icon }]}>
            Loading timesheet data...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <ThemedText style={styles.title}>Hours Progress</ThemedText>

      {/* Today's Hours */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <View style={styles.labelContainer}>
            <Ionicons name="today" size={18} color={theme.primary} />
            <ThemedText style={styles.progressLabel}>Today</ThemedText>
          </View>
          <ThemedText style={styles.hoursText}>
            <ThemedText style={[styles.hoursValue, { color: theme.primary }]}>
              {todayHours.toFixed(1)}
            </ThemedText>
            <ThemedText style={{ color: theme.icon }}>
              {" "}
              / {DAILY_TARGET}h
            </ThemedText>
          </ThemedText>
        </View>
        <ProgressBar
          progress={todayProgress}
          color={theme.primary}
          backgroundColor={theme.border}
        />
      </View>

      {/* Week's Hours */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <View style={styles.labelContainer}>
            <Ionicons name="calendar" size={18} color={theme.success} />
            <ThemedText style={styles.progressLabel}>This Week</ThemedText>
          </View>
          <ThemedText style={styles.hoursText}>
            <ThemedText style={[styles.hoursValue, { color: theme.success }]}>
              {weekHours.toFixed(1)}
            </ThemedText>
            <ThemedText style={{ color: theme.icon }}>
              {" "}
              / {WEEKLY_TARGET}h
            </ThemedText>
          </ThemedText>
        </View>
        <ProgressBar
          progress={weekProgress}
          color={theme.success}
          backgroundColor={theme.border}
        />
      </View>

      {/* Motivational message */}
      <View
        style={[styles.messageContainer, { backgroundColor: theme.background }]}
      >
        <Ionicons
          name={todayProgress >= 1 ? "checkmark-circle" : "time-outline"}
          size={18}
          color={todayProgress >= 1 ? theme.success : theme.warning}
        />
        <ThemedText style={[styles.messageText, { color: theme.icon }]}>
          {todayProgress >= 1
            ? "Great job! Daily target achieved! 🎉"
            : `${(DAILY_TARGET - todayHours).toFixed(1)}h remaining to reach daily goal`}
        </ThemedText>
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
    marginBottom: 20,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  hoursText: {
    fontSize: 14,
  },
  hoursValue: {
    fontWeight: "700",
    fontSize: 16,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    padding: 12,
    borderRadius: 10,
  },
  messageText: {
    fontSize: 13,
    flex: 1,
  },
});

// components/home/WeeklyChart.tsx
// Bar chart showing hours logged for each day of the week

import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useOdoo } from "@/context/OdooContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { timesheetService } from "@/services/timesheet.service";

interface DayData {
  day: string;
  hours: number;
  isToday: boolean;
}

export function WeeklyChart({ refreshTrigger }: { refreshTrigger?: number }) {
  const { client, isAuthenticated, uid } = useOdoo();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxHours, setMaxHours] = useState(8);

  const fetchWeekData = useCallback(async () => {
    if (!client || !isAuthenticated || !uid) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const employeeId = await timesheetService.getEmployeeId(client, uid);
      if (!employeeId) {
        setIsLoading(false);
        return;
      }

      const today = new Date();
      const dayOfWeek = today.getDay();
      // Calculate Monday of current week
      const startOfWeek = new Date(today);
      startOfWeek.setDate(
        today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
      );

      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const data: DayData[] = [];
      let max = 8;

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        const hours = await timesheetService.getTotalHours(
          client,
          employeeId,
          dateStr,
          dateStr,
        );
        if (hours > max) max = hours;

        data.push({
          day: days[i],
          hours,
          isToday: dateStr === today.toISOString().split("T")[0],
        });
      }

      setMaxHours(Math.ceil(max));
      setWeekData(data);
    } catch (err) {
      console.error("Error fetching week data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [client, isAuthenticated, uid]);

  useEffect(() => {
    fetchWeekData();
  }, [fetchWeekData, refreshTrigger]);

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <ThemedText style={styles.title}>This Week</ThemedText>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      </View>
    );
  }

  const totalWeekHours = weekData.reduce((sum, day) => sum + day.hours, 0);

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.title}>This Week</ThemedText>
        <ThemedText style={[styles.totalHours, { color: theme.primary }]}>
          {totalWeekHours.toFixed(1)}h total
        </ThemedText>
      </View>

      <View style={styles.chartContainer}>
        {weekData.map((day, index) => {
          const barHeight = maxHours > 0 ? (day.hours / maxHours) * 100 : 0;
          return (
            <View key={index} style={styles.barContainer}>
              <ThemedText style={[styles.hoursLabel, { color: theme.icon }]}>
                {day.hours > 0 ? day.hours.toFixed(1) : ""}
              </ThemedText>
              <View
                style={[
                  styles.barBackground,
                  { backgroundColor: theme.border },
                ]}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(barHeight, day.hours > 0 ? 5 : 0)}%`,
                      backgroundColor: day.isToday
                        ? theme.primary
                        : theme.success,
                    },
                  ]}
                />
              </View>
              <ThemedText
                style={[
                  styles.dayLabel,
                  day.isToday && { color: theme.primary, fontWeight: "700" },
                ]}
              >
                {day.day}
              </ThemedText>
            </View>
          );
        })}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  totalHours: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  hoursLabel: {
    fontSize: 10,
    marginBottom: 4,
    height: 14,
  },
  barBackground: {
    width: "70%",
    height: 100,
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: "500",
  },
});

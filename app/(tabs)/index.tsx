import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { DashboardSummary } from "@/components/home/DashboardSummary";
import { HoursProgressCard } from "@/components/home/HoursProgressCard";
import { MotivationalCard } from "@/components/home/MotivationalCard";
import { QuickActions } from "@/components/home/QuickActions";
import { WeeklyChart } from "@/components/home/WeeklyChart";
import TimesheetForm from "@/components/timesheet/TimesheetForm";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function HomeScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // TODO: Get actual employee ID from user context or profile
  const EMPLOYEE_ID = 910;

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    // Small delay to show the refresh indicator
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleTimesheetSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* Existing Dashboard Summary - Clock and Check-in Status */}
        <DashboardSummary refreshTrigger={refreshKey} />

        {/* Quick Actions Grid */}
        <QuickActions onAddTimesheet={() => setShowTimesheetForm(true)} />

        {/* Hours Progress Card */}
        <HoursProgressCard refreshTrigger={refreshKey} />

        {/* Weekly Bar Chart */}
        <WeeklyChart refreshTrigger={refreshKey} />

        {/* Daily Motivational Quote */}
        <MotivationalCard />

        {/* Commented out original components */}
        {/* <AttendanceButton onAttendanceChange={() => setRefreshKey((prev) => prev + 1)} /> */}
        {/* <AttendanceHistory employeeId={EMPLOYEE_ID} refreshTrigger={refreshKey} /> */}
      </ScrollView>

      {/* Timesheet Form Modal */}
      <TimesheetForm
        visible={showTimesheetForm}
        onClose={() => setShowTimesheetForm(false)}
        onSuccess={handleTimesheetSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});

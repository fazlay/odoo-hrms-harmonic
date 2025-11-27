import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { AttendanceButton } from "@/components/home/AttendanceButton";
import { AttendanceHistory } from "@/components/home/AttendanceHistory";
import { DashboardSummary } from "@/components/home/DashboardSummary";

export default function HomeScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  // TODO: Get actual employee ID from user context or profile
  const EMPLOYEE_ID = 910;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <DashboardSummary refreshTrigger={refreshKey} />
      <AttendanceButton onAttendanceChange={() => setRefreshKey((prev) => prev + 1)} />
      <AttendanceHistory employeeId={EMPLOYEE_ID} refreshTrigger={refreshKey} />
    </ScrollView>
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

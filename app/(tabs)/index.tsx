import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { AttendanceButton } from "@/components/home/AttendanceButton";
import { DashboardSummary } from "@/components/home/DashboardSummary";
import { HomePartnerList } from "@/components/home/HomePartnerList";

export default function HomeScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <DashboardSummary refreshTrigger={refreshKey} />
      <AttendanceButton onAttendanceChange={() => setRefreshKey((prev) => prev + 1)} />
      <HomePartnerList />
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

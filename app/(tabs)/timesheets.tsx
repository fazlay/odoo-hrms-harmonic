import TimesheetForm from "@/components/timesheet/TimesheetForm";
import TimesheetList from "@/components/timesheet/TimesheetList";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Timesheet } from "@/config/type";
import { Colors } from "@/constants/theme";
import { useTimesheetActions, useTimesheetSummary } from "@/hooks/useTimesheet";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TimesheetsScreen() {
  const [formVisible, setFormVisible] = useState(false);
  const [editTimesheet, setEditTimesheet] = useState<Timesheet | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { deleteTimesheet } = useTimesheetActions();
  const {
    todayHours,
    weekHours,
    isLoading: loadingSummary,
  } = useTimesheetSummary(refreshKey);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (timesheet: Timesheet) => {
    setEditTimesheet(timesheet);
    setFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    await deleteTimesheet(id);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setEditTimesheet(null);
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <IconSymbol name="clock" size={20} color={Colors.light.tint} />
            <View>
              <Text style={styles.summaryLabel}>Today</Text>
              <Text style={styles.summaryValue}>
                {loadingSummary ? "..." : formatHours(todayHours)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <IconSymbol name="calendar" size={20} color={Colors.light.tint} />
            <View>
              <Text style={styles.summaryLabel}>This Week</Text>
              <Text style={styles.summaryValue}>
                {loadingSummary ? "..." : formatHours(weekHours)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Timesheet List */}
      <TimesheetList
        refreshTrigger={refreshKey}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditTimesheet(null);
          setFormVisible(true);
        }}
      >
        <IconSymbol name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Form Modal */}
      <TimesheetForm
        visible={formVisible}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        editTimesheet={editTimesheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  summaryContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#eee",
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: Colors.light.tint,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

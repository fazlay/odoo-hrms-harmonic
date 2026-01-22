import { IconSymbol } from "@/components/ui/icon-symbol";
import { Timesheet } from "@/config/type";
import { Colors } from "@/constants/theme";
import { useTimesheets } from "@/hooks/useTimesheet";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TimesheetListProps {
  refreshTrigger?: number;
  onEdit?: (timesheet: Timesheet) => void;
  onDelete?: (id: number) => Promise<void>;
}

export default function TimesheetList({
  refreshTrigger,
  onEdit,
  onDelete,
}: TimesheetListProps) {
  const { timesheets, isLoading, error, refetch } = useTimesheets(
    {},
    refreshTrigger,
  );
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h${m}m`;
  };

  const handleDelete = (item: Timesheet) => {
    Alert.alert(
      "Delete Timesheet",
      "Are you sure you want to delete this timesheet entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (onDelete) {
              await onDelete(item.id);
              await refetch();
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Timesheet }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {/* Date Badge */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{new Date(item.date).getDate()}</Text>
          <Text style={styles.dateMonth}>
            {formatDate(item.date).split(" ")[0]}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.topRow}>
            <Text style={styles.projectName} numberOfLines={1}>
              {item.project_id ? item.project_id[1] : "No Project"}
            </Text>
            <View style={styles.hoursBadge}>
              <Text style={styles.hoursText}>
                {formatHours(item.unit_amount)}
              </Text>
            </View>
          </View>

          {item.task_id && (
            <Text style={styles.taskName} numberOfLines={1}>
              {item.task_id[1]}
            </Text>
          )}

          {item.name && item.name !== "/" && (
            <Text style={styles.description} numberOfLines={1}>
              {item.name}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(item)}
            >
              <IconSymbol name="pencil" size={16} color={Colors.light.tint} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item)}
            >
              <IconSymbol name="trash" size={16} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <ActivityIndicator
        style={styles.centered}
        size="large"
        color={Colors.light.tint}
      />
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={timesheets}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <IconSymbol name="clock" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No timesheet entries found.</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first entry</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 12,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateBadge: {
    width: 44,
    height: 44,
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  dateDay: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.tint,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: "500",
    color: "#666",
    textTransform: "uppercase",
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  projectName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  hoursBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hoursText: {
    color: "white",
    fontWeight: "600",
    fontSize: 11,
  },
  taskName: {
    fontSize: 12,
    color: "#666",
  },
  description: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "column",
    gap: 4,
  },
  actionButton: {
    padding: 6,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
  },
  errorText: {
    color: "#F44336",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});

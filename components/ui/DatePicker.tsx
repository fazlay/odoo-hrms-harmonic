import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import React, { useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DatePicker({
  visible,
  onClose,
  onSelect,
  selectedDate,
}: DatePickerProps) {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();

    const days: (number | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [currentMonth, currentYear]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayPress = (day: number) => {
    const month = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateStr = `${currentYear}-${month}-${dayStr}`;
    onSelect(dateStr);
    onClose();
  };

  const isSelected = (day: number) => {
    if (!selectedDateObj) return false;
    return (
      selectedDateObj.getDate() === day &&
      selectedDateObj.getMonth() === currentMonth &&
      selectedDateObj.getFullYear() === currentYear
    );
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
              <IconSymbol name="chevron.left" size={20} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={goToToday} style={styles.monthYear}>
              <Text style={styles.monthYearText}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <IconSymbol name="chevron.right" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Day names */}
          <View style={styles.daysRow}>
            {DAYS.map((day) => (
              <View key={day} style={styles.dayNameCell}>
                <Text style={styles.dayNameText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendar}>
            {calendarDays.map((day, index) => (
              <View key={index} style={styles.dayCell}>
                {day !== null ? (
                  <TouchableOpacity
                    style={[
                      styles.dayButton,
                      isSelected(day) && styles.selectedDay,
                      isToday(day) && !isSelected(day) && styles.todayDay,
                    ]}
                    onPress={() => handleDayPress(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected(day) && styles.selectedDayText,
                        isToday(day) && !isSelected(day) && styles.todayDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => {
                onSelect(todayStr);
                onClose();
              }}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 340,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    flex: 1,
    alignItems: "center",
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  daysRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  dayButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  selectedDay: {
    backgroundColor: Colors.light.tint,
  },
  selectedDayText: {
    color: "white",
    fontWeight: "600",
  },
  todayDay: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  todayDayText: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 12,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  todayButtonText: {
    fontSize: 15,
    color: Colors.light.tint,
    fontWeight: "500",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 15,
    color: "#666",
  },
});

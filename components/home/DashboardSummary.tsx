import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useOdoo } from "@/context/OdooContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { attendanceService } from "@/services/attendance.service";

export function DashboardSummary({ refreshTrigger }: { refreshTrigger?: number }) {
    const { client } = useOdoo();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const [currentTime, setCurrentTime] = useState(new Date());
    const [checkInTime, setCheckInTime] = useState<Date | null>(null);

    // TODO: Get actual employee ID
    const EMPLOYEE_ID = 910;

    useEffect(() => {
        // Update clock every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Check attendance status to show check-in time
        const checkStatus = async () => {
            if (!client) return;
            try {
                const todaysAttendance = await attendanceService.getTodaysAttendance(
                    client,
                    EMPLOYEE_ID
                );
                if (todaysAttendance && !todaysAttendance.check_out) {
                    // Parse Odoo UTC time string to Date object
                    // Odoo format: YYYY-MM-DD HH:mm:ss (UTC)
                    // We append 'Z' to treat it as UTC
                    const utcString = todaysAttendance.check_in.replace(" ", "T") + "Z";
                    setCheckInTime(new Date(utcString));
                } else {
                    setCheckInTime(null);
                }
            } catch (error) {
                console.error("Error fetching attendance for summary:", error);
            }
        };

        checkStatus();
        // Poll every minute to keep status fresh
        const statusTimer = setInterval(checkStatus, 60000);
        return () => clearInterval(statusTimer);
    }, [client, refreshTrigger]);

    return (
        <View style={[styles.card, { backgroundColor: theme.tint }]}>
            <View style={styles.row}>
                <View>
                    <ThemedText style={styles.dateText}>
                        {format(currentTime, "EEEE, d MMMM")}
                    </ThemedText>
                    <ThemedText style={styles.timeText}>
                        {format(currentTime, "HH:mm")}
                    </ThemedText>
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons name="calendar-outline" size={32} color="white" />
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statusRow}>
                <Ionicons
                    name={checkInTime ? "checkmark-circle" : "time-outline"}
                    size={20}
                    color="white"
                />
                <ThemedText style={styles.statusText}>
                    {checkInTime
                        ? `Checked in at ${format(checkInTime, "HH:mm")}`
                        : "Not checked in yet"}
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    timeText: {
        color: "white",
        fontSize: 36,
        fontWeight: "bold",
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.2)",
        marginVertical: 16,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statusText: {
        color: "white",
        fontSize: 14,
        fontWeight: "500",
    },
});

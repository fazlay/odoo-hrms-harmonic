import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Attendance } from "@/config/type";
import { Colors } from "@/constants/theme";
import { useOdoo } from "@/context/OdooContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface AttendanceHistoryProps {
    employeeId: number;
    refreshTrigger?: number;
}

export function AttendanceHistory({ employeeId, refreshTrigger }: AttendanceHistoryProps) {
    const { client } = useOdoo();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    React.useEffect(() => {
        fetchAttendances();
    }, [client, employeeId, refreshTrigger]);

    const fetchAttendances = async () => {
        if (!client) return;
        try {
            setIsLoading(true);
            setError(null);

            const domain = [["employee_id", "=", employeeId]];
            const records = await client.searchRead(
                "hr.attendance",
                domain,
                [
                    "employee_id",
                    "check_in",
                    "check_out",
                    "in_latitude",
                    "in_longitude",
                    "out_latitude",
                    "out_longitude",
                    "in_mode",
                ],
                10,
                0,
                "check_in desc"
            );
            setAttendances(records);
        } catch (err: any) {
            setError(err.message || "Failed to fetch attendance history");
            console.error("Error fetching attendance history:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const utcString = dateString.replace(" ", "T") + "Z";
        const date = new Date(utcString);
        return format(date, "MMM dd, yyyy");
    };

    const formatTime = (dateString: string) => {
        const utcString = dateString.replace(" ", "T") + "Z";
        const date = new Date(utcString);
        return format(date, "HH:mm");
    };

    const formatCoords = (lat?: number, lng?: number) => {
        if (!lat || !lng) return "No location";
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    };

    const calculateDuration = (checkIn: string, checkOut?: string) => {
        if (!checkOut) return "In progress";
        const start = new Date(checkIn.replace(" ", "T") + "Z");
        const end = new Date(checkOut.replace(" ", "T") + "Z");
        const diff = end.getTime() - start.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <View style={styles.content}>
            <View style={styles.header}>
                <ThemedText type="subtitle">Attendance History</ThemedText>
                <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>{attendances.length}</ThemedText>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
                    <ThemedText style={styles.error}>Error: {error}</ThemedText>
                </View>
            ) : (
                <View style={styles.list}>
                    {attendances.map((attendance) => {
                        const isExpanded = expandedId === attendance.id;
                        const isCheckedOut = !!attendance.check_out;

                        return (
                            <TouchableOpacity
                                key={attendance.id}
                                activeOpacity={0.7}
                                onPress={() => toggleExpand(attendance.id)}
                            >
                                <View style={[styles.card, { backgroundColor: theme.card }]}>
                                    {/* Compact Header */}
                                    <View style={styles.compactHeader}>
                                        <View style={styles.dateSection}>
                                            <Ionicons
                                                name="calendar-outline"
                                                size={16}
                                                color={theme.icon}
                                            />
                                            <ThemedText style={styles.dateText}>
                                                {formatDate(attendance.check_in)}
                                            </ThemedText>
                                        </View>

                                        <View style={styles.timeSection}>
                                            <View style={styles.timeRow}>
                                                <Ionicons
                                                    name="log-in-outline"
                                                    size={14}
                                                    color="#17C964"
                                                />
                                                <ThemedText style={styles.timeText}>
                                                    {formatTime(attendance.check_in)}
                                                </ThemedText>
                                            </View>
                                            <ThemedText style={styles.separator}>→</ThemedText>
                                            <View style={styles.timeRow}>
                                                <Ionicons
                                                    name="log-out-outline"
                                                    size={14}
                                                    color={isCheckedOut ? "#F5A524" : "#9CA3AF"}
                                                />
                                                <ThemedText style={styles.timeText}>
                                                    {isCheckedOut
                                                        ? formatTime(attendance.check_out!)
                                                        : "--:--"}
                                                </ThemedText>
                                            </View>
                                        </View>

                                        <View style={styles.rightSection}>
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    {
                                                        backgroundColor: isCheckedOut
                                                            ? "rgba(245, 165, 36, 0.15)"
                                                            : "rgba(23, 201, 100, 0.15)",
                                                    },
                                                ]}
                                            >
                                                <ThemedText
                                                    style={[
                                                        styles.statusText,
                                                        { color: isCheckedOut ? "#F5A524" : "#17C964" },
                                                    ]}
                                                >
                                                    {calculateDuration(
                                                        attendance.check_in,
                                                        attendance.check_out
                                                    )}
                                                </ThemedText>
                                            </View>
                                            <Ionicons
                                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color={theme.icon}
                                            />
                                        </View>
                                    </View>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <View style={styles.expandedContent}>
                                            <View
                                                style={[styles.divider, { backgroundColor: theme.border }]}
                                            />

                                            {/* Check In Details */}
                                            <View style={styles.detailSection}>
                                                <View style={styles.detailHeader}>
                                                    <View
                                                        style={[
                                                            styles.iconBadge,
                                                            { backgroundColor: "#17C964" },
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name="log-in-outline"
                                                            size={14}
                                                            color="white"
                                                        />
                                                    </View>
                                                    <ThemedText style={styles.detailTitle}>
                                                        Check In
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.detailInfo}>
                                                    <View style={styles.infoRow}>
                                                        <Ionicons
                                                            name="time-outline"
                                                            size={14}
                                                            color={theme.icon}
                                                        />
                                                        <ThemedText style={styles.infoText}>
                                                            {formatTime(attendance.check_in)}
                                                        </ThemedText>
                                                    </View>
                                                    <View style={styles.infoRow}>
                                                        <Ionicons
                                                            name="location-outline"
                                                            size={14}
                                                            color={theme.icon}
                                                        />
                                                        <ThemedText
                                                            style={styles.infoText}
                                                            numberOfLines={1}
                                                        >
                                                            {formatCoords(
                                                                attendance.in_latitude,
                                                                attendance.in_longitude
                                                            )}
                                                        </ThemedText>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Check Out Details */}
                                            <View style={styles.detailSection}>
                                                <View style={styles.detailHeader}>
                                                    <View
                                                        style={[
                                                            styles.iconBadge,
                                                            {
                                                                backgroundColor: isCheckedOut
                                                                    ? "#F5A524"
                                                                    : "#9CA3AF",
                                                            },
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name="log-out-outline"
                                                            size={14}
                                                            color="white"
                                                        />
                                                    </View>
                                                    <ThemedText style={styles.detailTitle}>
                                                        Check Out
                                                    </ThemedText>
                                                </View>
                                                {isCheckedOut ? (
                                                    <View style={styles.detailInfo}>
                                                        <View style={styles.infoRow}>
                                                            <Ionicons
                                                                name="time-outline"
                                                                size={14}
                                                                color={theme.icon}
                                                            />
                                                            <ThemedText style={styles.infoText}>
                                                                {formatTime(attendance.check_out!)}
                                                            </ThemedText>
                                                        </View>
                                                        <View style={styles.infoRow}>
                                                            <Ionicons
                                                                name="location-outline"
                                                                size={14}
                                                                color={theme.icon}
                                                            />
                                                            <ThemedText
                                                                style={styles.infoText}
                                                                numberOfLines={1}
                                                            >
                                                                {formatCoords(
                                                                    attendance.out_latitude,
                                                                    attendance.out_longitude
                                                                )}
                                                            </ThemedText>
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <ThemedText style={styles.pendingText}>
                                                        Still checked in...
                                                    </ThemedText>
                                                )}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    {attendances.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={48} color={theme.icon} />
                            <ThemedText style={styles.empty}>No attendance records yet</ThemedText>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        marginTop: 24,
        gap: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    badge: {
        backgroundColor: "rgba(0, 111, 238, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    badgeText: {
        color: "#006FEE",
        fontSize: 13,
        fontWeight: "bold",
    },
    centerContainer: {
        padding: 32,
        alignItems: "center",
        gap: 8,
    },
    list: {
        gap: 8,
    },
    card: {
        padding: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    compactHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    dateSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        minWidth: 90,
    },
    dateText: {
        fontSize: 12,
        fontWeight: "600",
    },
    timeSection: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    timeText: {
        fontSize: 13,
        fontWeight: "500",
    },
    separator: {
        fontSize: 12,
        opacity: 0.4,
    },
    rightSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
    },
    expandedContent: {
        marginTop: 12,
        gap: 12,
    },
    divider: {
        height: 1,
        opacity: 0.1,
    },
    detailSection: {
        gap: 8,
    },
    detailHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    detailTitle: {
        fontSize: 13,
        fontWeight: "600",
    },
    detailInfo: {
        marginLeft: 32,
        gap: 6,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    infoText: {
        fontSize: 12,
        opacity: 0.7,
        flex: 1,
    },
    pendingText: {
        fontSize: 12,
        opacity: 0.5,
        fontStyle: "italic",
        marginLeft: 32,
    },
    error: {
        color: "#F31260",
        textAlign: "center",
    },
    emptyContainer: {
        padding: 32,
        alignItems: "center",
        gap: 8,
        opacity: 0.5,
    },
    empty: {
        textAlign: "center",
    },
});

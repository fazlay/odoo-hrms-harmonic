import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { useOdoo } from "@/context/OdooContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { attendanceService } from "@/services/attendance.service";

export function AttendanceButton({
    onAttendanceChange,
}: {
    onAttendanceChange?: () => void;
}) {
    const { client } = useOdoo();
    const colorScheme = useColorScheme();
    const scale = useSharedValue(1);
    const [isLoading, setIsLoading] = useState(true);
    const [currentAttendance, setCurrentAttendance] = useState<any>(null);

    // TODO: Get actual employee ID from user context or profile
    const EMPLOYEE_ID = 910;

    useEffect(() => {
        checkStatus();
    }, [client]);

    const checkStatus = async () => {
        if (!client) return;
        try {
            setIsLoading(true);
            // Check for today's attendance only
            const todaysAttendance = await attendanceService.getTodaysAttendance(
                client,
                EMPLOYEE_ID
            );
            setCurrentAttendance(todaysAttendance);
        } catch (error) {
            console.error("Error checking attendance status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = async () => {
        if (!client) return;

        scale.value = withSpring(0.95, {}, () => {
            scale.value = withSpring(1);
        });

        try {
            setIsLoading(true);
            // Send UTC time to Odoo
            const now = new Date().toISOString().replace("T", " ").split(".")[0];

            // Logic:
            // If we have a record for today AND it is NOT checked out -> Punch Out
            // If we have NO record for today OR it IS checked out -> Punch In

            const isCheckedIn = currentAttendance && !currentAttendance.check_out;

            if (isCheckedIn) {
                // Punch Out
                await attendanceService.updateAttendance(client, currentAttendance.id, {
                    check_out: now,
                });
                // After punch out, we still have a record for today, but it's checked out.
                // We refresh to get the updated record.
            } else {
                // Punch In
                await attendanceService.createAttendance(client, {
                    employee_id: EMPLOYEE_ID,
                    check_in: now,
                });
            }
            // Refresh status
            await checkStatus();
            // Notify parent
            if (onAttendanceChange) {
                onAttendanceChange();
            }
        } catch (error) {
            console.error("Error updating attendance:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Determine UI state
    // We are "Checked In" if we have a record AND check_out is false/empty
    const isCheckedIn = currentAttendance && !currentAttendance.check_out;

    const gradientColors: readonly [string, string, string] = isCheckedIn
        ? colorScheme === "dark"
            ? ["#F7B750", "#E89B2E", "#D67F0C"]
            : ["#F5A524", "#E89B2E", "#D67F0C"]
        : colorScheme === "dark"
            ? ["#338EF7", "#1E5FCC", "#0F3B8C"]
            : ["#006FEE", "#0062D1", "#0052B3"];

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.buttonWrapper, animatedStyle]}>
                <TouchableOpacity
                    onPress={handlePress}
                    activeOpacity={0.9}
                    disabled={isLoading}
                >
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.button}
                    >
                        <View style={styles.iconContainer}>
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Ionicons
                                    name={isCheckedIn ? "log-out-outline" : "finger-print"}
                                    size={32}
                                    color="white"
                                />
                            )}
                        </View>
                        <View style={styles.textContainer}>
                            <ThemedText style={styles.buttonTitle}>
                                {isCheckedIn ? "Punch Out" : "Punch In"}
                            </ThemedText>
                            <ThemedText style={styles.buttonSubtitle}>
                                {isCheckedIn ? "End your shift" : "Start your shift"}
                            </ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    buttonWrapper: {
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    button: {
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        flex: 1,
    },
    buttonTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
    },
    buttonSubtitle: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 14,
    },
});

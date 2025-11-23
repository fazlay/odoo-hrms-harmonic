import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useOdoo } from "@/context/OdooContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function TopHeader() {
    const { logout, uid } = useOdoo();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const insets = useSafeAreaInsets();

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await logout();
                },
            },
        ]);
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.background,
                    paddingTop: insets.top,
                    borderBottomColor: colorScheme === "dark" ? "#333" : "#eee",
                },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.userInfo}>
                    <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
                        <ThemedText style={styles.avatarText}>U</ThemedText>
                    </View>
                    <View>
                        <ThemedText style={styles.greeting}>Welcome back,</ThemedText>
                        <ThemedText style={styles.userId}>User #{uid}</ThemedText>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="log-out-outline" size={24} color={theme.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 100,
    },
    content: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    greeting: {
        fontSize: 12,
        opacity: 0.7,
    },
    userId: {
        fontSize: 16,
        fontWeight: "bold",
    },
    logoutButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.05)",
    },
});

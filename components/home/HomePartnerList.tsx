import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCompanies } from "@/hooks/usePartners";

export function HomePartnerList() {
    const { partners, isLoading, error } = useCompanies(5);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    return (
        <View style={styles.content}>
            <View style={styles.header}>
                <ThemedText type="subtitle">Recent Partners</ThemedText>
                <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>{partners.length}</ThemedText>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="red" />
                    <ThemedText style={styles.error}>Error: {error}</ThemedText>
                </View>
            ) : (
                <View style={styles.list}>
                    {partners.map((partner) => (
                        <View
                            key={partner.id}
                            style={[styles.card, { backgroundColor: theme.background }]}
                        >
                            <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
                                <ThemedText style={styles.avatarText}>
                                    {partner.name.charAt(0).toUpperCase()}
                                </ThemedText>
                            </View>
                            <View style={styles.info}>
                                <ThemedText style={styles.name} numberOfLines={1}>
                                    {partner.name}
                                </ThemedText>
                                {partner.email && (
                                    <ThemedText style={styles.email} numberOfLines={1}>
                                        {partner.email}
                                    </ThemedText>
                                )}
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={theme.icon}
                                style={{ opacity: 0.5 }}
                            />
                        </View>
                    ))}
                    {partners.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color={theme.icon} />
                            <ThemedText style={styles.empty}>No partners found</ThemedText>
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
        backgroundColor: "rgba(0, 122, 255, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        color: "#007AFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    centerContainer: {
        padding: 32,
        alignItems: "center",
        gap: 8,
    },
    list: {
        gap: 12,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
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
        fontSize: 16,
        fontWeight: "bold",
    },
    info: {
        flex: 1,
        gap: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
    },
    email: {
        fontSize: 13,
        opacity: 0.6,
    },
    error: {
        color: "red",
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

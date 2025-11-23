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
                    <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
                    <ThemedText style={styles.error}>Error: {error}</ThemedText>
                </View>
            ) : (
                <View style={styles.list}>
                    {partners.map((partner) => (
                        <View
                            key={partner.id}
                            style={[styles.card, { backgroundColor: theme.card }]}
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
        marginBottom: 12,
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
        gap: 12,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        gap: 14,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    info: {
        flex: 1,
        gap: 4,
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

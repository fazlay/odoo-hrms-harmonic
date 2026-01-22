import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useLeaves } from '@/hooks/useLeaves'; // Added import for useLeaves
import { Leave } from '@/services/leave.service';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function LeaveList({ refreshTrigger }: { refreshTrigger?: number }) {
    const { leaves, isLoading, error, refetch } = useLeaves(refreshTrigger); // Replaced state and fetch logic with useLeaves hook
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => { // Modified onRefresh to use refetch from useLeaves
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const getStatusColor = (state: string) => {
        switch (state) {
            case 'validate':
                return '#4CAF50'; // Green
            case 'confirm':
            case 'validate1':
                return '#FF9800'; // Orange
            case 'refuse':
                return '#F44336'; // Red
            default:
                return '#9E9E9E'; // Grey
        }
    };

    const getStatusLabel = (state: string) => {
        switch (state) {
            case 'validate': return 'Approved';
            case 'confirm': return 'To Approve';
            case 'validate1': return 'Second Approval';
            case 'refuse': return 'Refused';
            case 'draft': return 'Draft';
            default: return state;
        }
    };

    const renderItem = ({ item }: { item: Leave }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.type}>{item.holiday_status_id[1]}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.state) }]}>
                    <Text style={styles.badgeText}>{getStatusLabel(item.state)}</Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>{item.name || 'No description'}</Text>

            <View style={styles.footer}>
                <View style={styles.dateContainer}>
                    <IconSymbol name="calendar" size={16} color="#666" />
                    <Text style={styles.dateText}>
                        {new Date(item.date_from).toLocaleDateString()} - {new Date(item.date_to).toLocaleDateString()}
                    </Text>
                </View>
                <Text style={styles.duration}>{item.duration_display} days</Text>
            </View>
        </View>
    );

    if (isLoading && !refreshing) {
        return <ActivityIndicator style={styles.centered} size="large" color={Colors.light.tint} />;
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={leaves}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>No leave requests found.</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 16,
        paddingBottom: 100, // Space for FAB
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    type: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: '#555',
    },
    duration: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    },
});

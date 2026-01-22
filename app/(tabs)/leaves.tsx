import LeaveForm from '@/components/leaves/LeaveForm';
import LeaveList from '@/components/leaves/LeaveList';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LeavesScreen() {
    const [formVisible, setFormVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <View style={styles.container}>
            <LeaveList refreshTrigger={refreshKey} />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setFormVisible(true)}
            >
                <IconSymbol name="plus" size={24} color="white" />
            </TouchableOpacity>

            <LeaveForm
                visible={formVisible}
                onClose={() => setFormVisible(false)}
                onSuccess={handleSuccess}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: Colors.light.tint,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

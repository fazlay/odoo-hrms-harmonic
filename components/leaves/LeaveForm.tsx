import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useOdoo } from '@/context/OdooContext';
import { useLeaveTypes } from '@/hooks/useLeaves';
import { leaveService, LeaveType } from '@/services/leave.service';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface LeaveFormProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function LeaveForm({ visible, onClose, onSuccess }: LeaveFormProps) {
    const { client, uid } = useOdoo();
    const { leaveTypes, isLoading: loadingTypes } = useLeaveTypes();
    const [selectedType, setSelectedType] = useState<LeaveType | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);

    // The useEffect and loadLeaveTypes function are no longer needed as useLeaveTypes handles fetching
    // useEffect(() => {
    //     if (visible && client) {
    //         loadLeaveTypes();
    //     }
    // }, [visible, client]);

    // const loadLeaveTypes = async () => {
    //     if (!client) return;
    //     setLoading(true);
    //     try {
    //         const types = await getLeaveTypes(client);
    //         setLeaveTypes(types);
    //     } catch (error) {
    //         console.error("Failed to load leave types", error);
    //         Alert.alert("Error", "Failed to load leave types");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleSubmit = async () => {
        if (!client || !uid) return;
        if (!selectedType || !startDate || !endDate) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        // Basic date validation (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            Alert.alert("Error", "Dates must be in YYYY-MM-DD format");
            return;
        }

        setSubmitting(true);
        try {
            const employeeId = await leaveService.getEmployeeId(client, uid);
            if (!employeeId) {
                throw new Error("Employee record not found");
            }

            await leaveService.createLeaveRequest(
                client,
                employeeId,
                selectedType.id,
                startDate,
                endDate,
                description
            );

            Alert.alert("Success", "Leave request submitted successfully");
            onSuccess();
            onClose();
            // Reset form
            setStartDate('');
            setEndDate('');
            setDescription('');
            setSelectedType(null);
        } catch (error: any) {
            console.error("Failed to submit leave request", error);
            Alert.alert("Error", error.message || "Failed to submit leave request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Apply for Leave</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <IconSymbol name="xmark.circle.fill" size={30} color="#ccc" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.form}>
                    <Text style={styles.label}>Leave Type *</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowTypePicker(true)}
                    >
                        <Text style={selectedType ? styles.inputText : styles.placeholder}>
                            {selectedType ? selectedType.display_name : "Select Leave Type"}
                        </Text>
                        <IconSymbol name="chevron.down" size={20} color="#666" />
                    </TouchableOpacity>

                    <Text style={styles.label}>Start Date (YYYY-MM-DD) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="2023-12-01"
                        value={startDate}
                        onChangeText={setStartDate}
                        keyboardType="numbers-and-punctuation"
                    />

                    <Text style={styles.label}>End Date (YYYY-MM-DD) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="2023-12-05"
                        value={endDate}
                        onChangeText={setEndDate}
                        keyboardType="numbers-and-punctuation"
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Reason for leave..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Request</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>

                {/* Leave Type Picker Modal */}
                <Modal visible={showTypePicker} transparent animationType="fade">
                    <View style={styles.pickerOverlay}>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerTitle}>Select Leave Type</Text>
                            {loadingTypes ? (
                                <ActivityIndicator size="large" color={Colors.light.tint} />
                            ) : (
                                <FlatList
                                    data={leaveTypes}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.pickerItem}
                                            onPress={() => {
                                                setSelectedType(item);
                                                setShowTypePicker(false);
                                            }}
                                        >
                                            <Text style={styles.pickerItemText}>{item.display_name}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                            <TouchableOpacity
                                style={styles.pickerCloseButton}
                                onPress={() => setShowTypePicker(false)}
                            >
                                <Text style={styles.pickerCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputText: {
        color: '#333',
    },
    placeholder: {
        color: '#999',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: Colors.light.tint,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        maxHeight: '80%',
        padding: 20,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    pickerItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    pickerItemText: {
        fontSize: 16,
        color: '#333',
    },
    pickerCloseButton: {
        marginTop: 15,
        padding: 12,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    pickerCloseText: {
        color: '#333',
        fontWeight: '600',
    },
});

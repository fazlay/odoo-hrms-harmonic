import DatePicker from "@/components/ui/DatePicker";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Project, Task, Timesheet } from "@/config/type";
import { Colors } from "@/constants/theme";
import {
  useProjects,
  useTasks,
  useTimesheetActions,
} from "@/hooks/useTimesheet";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TimesheetFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTimesheet?: Timesheet | null;
}

export default function TimesheetForm({
  visible,
  onClose,
  onSuccess,
  editTimesheet,
}: TimesheetFormProps) {
  const { projects, isLoading: loadingProjects } = useProjects();
  const {
    tasks,
    isLoading: loadingTasks,
    loadTasksForProject,
    clearTasks,
  } = useTasks();
  const { createTimesheet, updateTimesheet, isSubmitting } =
    useTimesheetActions();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isEditMode = !!editTimesheet;

  // Reset form or populate with edit data
  useEffect(() => {
    if (visible) {
      if (editTimesheet) {
        // Populate form with existing data
        setDate(editTimesheet.date);
        setHours(editTimesheet.unit_amount.toString());
        setDescription(editTimesheet.name === "/" ? "" : editTimesheet.name);

        // Set project from edit data
        if (editTimesheet.project_id) {
          const projectFromEdit = {
            id: editTimesheet.project_id[0],
            name: editTimesheet.project_id[1],
            display_name: editTimesheet.project_id[1],
            active: true,
          };
          setSelectedProject(projectFromEdit);
          loadTasksForProject(editTimesheet.project_id[0]);
        }

        // Set task from edit data
        if (editTimesheet.task_id) {
          const taskFromEdit: Task = {
            id: editTimesheet.task_id[0],
            name: editTimesheet.task_id[1],
            display_name: editTimesheet.task_id[1],
            project_id: editTimesheet.project_id
              ? editTimesheet.project_id
              : false,
          };
          setSelectedTask(taskFromEdit);
        }
      } else {
        // Reset form for new entry
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
        setHours("");
        setDescription("");
        setSelectedProject(null);
        setSelectedTask(null);
        clearTasks();
      }
    }
  }, [visible, editTimesheet]);

  // Load tasks when project changes
  useEffect(() => {
    if (selectedProject && !isEditMode) {
      loadTasksForProject(selectedProject.id);
      setSelectedTask(null);
    }
  }, [selectedProject]);

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setShowProjectPicker(false);
    setSelectedTask(null);
    loadTasksForProject(project.id);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setShowTaskPicker(false);
  };

  const validateForm = (): boolean => {
    if (!selectedProject) {
      Alert.alert("Error", "Please select a project");
      return false;
    }
    if (!date) {
      Alert.alert("Error", "Please select a date");
      return false;
    }
    if (!hours || isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
      Alert.alert("Error", "Please enter valid hours");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode && editTimesheet) {
        await updateTimesheet(editTimesheet.id, {
          name: description || "/",
          date: date,
          unit_amount: parseFloat(hours),
          project_id: selectedProject!.id,
          task_id: selectedTask?.id || false,
        });
        Alert.alert("Success", "Timesheet updated successfully");
      } else {
        await createTimesheet({
          name: description || "/",
          date: date,
          unit_amount: parseFloat(hours),
          project_id: selectedProject!.id,
          task_id: selectedTask?.id,
        });
        Alert.alert("Success", "Timesheet created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save timesheet", error);
      Alert.alert("Error", error.message || "Failed to save timesheet");
    }
  };

  const renderProjectItem = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={[
        styles.pickerItem,
        selectedProject?.id === item.id && styles.pickerItemSelected,
      ]}
      onPress={() => handleProjectSelect(item)}
    >
      <IconSymbol name="folder.fill" size={20} color={Colors.light.tint} />
      <Text style={styles.pickerItemText}>{item.display_name}</Text>
      {selectedProject?.id === item.id && (
        <IconSymbol name="checkmark" size={18} color={Colors.light.tint} />
      )}
    </TouchableOpacity>
  );

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[
        styles.pickerItem,
        selectedTask?.id === item.id && styles.pickerItemSelected,
      ]}
      onPress={() => handleTaskSelect(item)}
    >
      <IconSymbol name="checkmark.circle" size={20} color="#666" />
      <Text style={styles.pickerItemText}>{item.display_name}</Text>
      {selectedTask?.id === item.id && (
        <IconSymbol name="checkmark" size={18} color={Colors.light.tint} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditMode ? "Edit Timesheet" : "Add Timesheet"}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark.circle.fill" size={30} color="#ccc" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form}>
          {/* Project Selector */}
          <Text style={styles.label}>Project *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowProjectPicker(true)}
          >
            <View style={styles.inputContent}>
              {selectedProject && (
                <IconSymbol
                  name="folder.fill"
                  size={18}
                  color={Colors.light.tint}
                />
              )}
              <Text
                style={selectedProject ? styles.inputText : styles.placeholder}
              >
                {selectedProject
                  ? selectedProject.display_name
                  : "Select Project"}
              </Text>
            </View>
            <IconSymbol name="chevron.down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Task Selector */}
          <Text style={styles.label}>Task (Optional)</Text>
          <TouchableOpacity
            style={[styles.input, !selectedProject && styles.inputDisabled]}
            onPress={() => selectedProject && setShowTaskPicker(true)}
            disabled={!selectedProject}
          >
            <View style={styles.inputContent}>
              {selectedTask && (
                <IconSymbol name="checkmark.circle" size={18} color="#666" />
              )}
              <Text
                style={selectedTask ? styles.inputText : styles.placeholder}
              >
                {selectedTask ? selectedTask.display_name : "Select Task"}
              </Text>
            </View>
            <IconSymbol name="chevron.down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Date Input */}
          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.inputContent}>
              <IconSymbol name="calendar" size={18} color={Colors.light.tint} />
              <Text style={date ? styles.inputText : styles.placeholder}>
                {date ? formatDisplayDate(date) : "Select Date"}
              </Text>
            </View>
            <IconSymbol name="chevron.down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Hours Input */}
          <Text style={styles.label}>Hours *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="1.5"
            value={hours}
            onChangeText={setHours}
            keyboardType="decimal-pad"
          />

          {/* Description Input */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="What did you work on?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? "Update Timesheet" : "Add Timesheet"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Project Picker Modal */}
        <Modal visible={showProjectPicker} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Project</Text>
              {loadingProjects ? (
                <ActivityIndicator
                  size="large"
                  color={Colors.light.tint}
                  style={styles.loader}
                />
              ) : projects.length === 0 ? (
                <View style={styles.emptyPicker}>
                  <Text style={styles.emptyPickerText}>
                    No projects available
                  </Text>
                  <Text style={styles.emptyPickerSubtext}>
                    Make sure projects have "Allow Timesheets" enabled in Odoo
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={projects}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderProjectItem}
                  style={styles.pickerList}
                />
              )}
              <TouchableOpacity
                style={styles.pickerCloseButton}
                onPress={() => setShowProjectPicker(false)}
              >
                <Text style={styles.pickerCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Task Picker Modal */}
        <Modal visible={showTaskPicker} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Task</Text>
              {loadingTasks ? (
                <ActivityIndicator
                  size="large"
                  color={Colors.light.tint}
                  style={styles.loader}
                />
              ) : tasks.length === 0 ? (
                <View style={styles.emptyPicker}>
                  <Text style={styles.emptyPickerText}>No tasks found</Text>
                  <Text style={styles.emptyPickerSubtext}>
                    This project has no tasks with timesheets enabled
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={tasks}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderTaskItem}
                  style={styles.pickerList}
                />
              )}
              <View style={styles.pickerFooter}>
                <TouchableOpacity
                  style={styles.pickerClearButton}
                  onPress={() => {
                    setSelectedTask(null);
                    setShowTaskPicker(false);
                  }}
                >
                  <Text style={styles.pickerClearText}>Clear Selection</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pickerCloseButton}
                  onPress={() => setShowTaskPicker(false)}
                >
                  <Text style={styles.pickerCloseText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker */}
        <DatePicker
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelect={setDate}
          selectedDate={date}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    minHeight: 50,
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    opacity: 0.7,
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  placeholder: {
    fontSize: 16,
    color: "#999",
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    fontSize: 16,
    color: "#333",
    minHeight: 50,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    textAlign: "center",
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  pickerItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  pickerFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  pickerClearButton: {
    padding: 14,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pickerClearText: {
    fontSize: 16,
    color: "#666",
  },
  pickerCloseButton: {
    padding: 16,
    alignItems: "center",
  },
  pickerCloseText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: "600",
  },
  loader: {
    padding: 40,
  },
  emptyPicker: {
    padding: 30,
    alignItems: "center",
  },
  emptyPickerText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  emptyPickerSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

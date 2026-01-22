// components/LoginScreen.tsx
// Purpose: First-time setup and login screen

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOdoo } from "@/context/OdooContext";

export default function LoginScreen() {
  const { saveAndConnect, isLoading, error: contextError } = useOdoo();

  const [protocol, setProtocol] = useState<"http" | "https">("http");
  const [serverAddress, setServerAddress] = useState("192.168.0.105:8018");
  const [db, setDb] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState<string | null>(null);

  // Database selection states
  const [databases, setDatabases] = useState<string[]>([]);
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [showDbPicker, setShowDbPicker] = useState(false);
  const [dbFetched, setDbFetched] = useState(false);

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Show context error if it exists (from failed auto-login)
  const displayError = error || contextError;

  // Get full URL
  const getFullUrl = useCallback(
    () => `${protocol}://${serverAddress.replace(/\/+$/, "")}`,
    [protocol, serverAddress],
  );

  const fetchDatabases = useCallback(async (address: string, proto: string) => {
    if (!address || address.length < 5) {
      return; // Don't fetch for very short addresses
    }

    try {
      setError(null);
      setLoadingDatabases(true);
      setDatabases([]);
      setDb("");
      setDbFetched(false);

      const fullUrl = `${proto}://${address.replace(/\/+$/, "")}`;

      // Try the Odoo database list endpoint
      const response = await fetch(`${fullUrl}/web/database/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {},
          id: 1,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(
          data.error.data?.message ||
            data.error.message ||
            "Failed to fetch databases",
        );
      }

      if (data.result && Array.isArray(data.result)) {
        setDatabases(data.result);
        setDbFetched(true);
        if (data.result.length === 1) {
          // Auto-select if only one database
          setDb(data.result[0]);
        }
        // Don't auto-show picker - let user click the field
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch databases:", err);
      // Only show error if it's not a network error from incomplete typing
      if (address.length > 5) {
        setError(err.message || "Failed to connect to server. Check the URL.");
      }
      setDbFetched(false);
    } finally {
      setLoadingDatabases(false);
    }
  }, []);

  // Auto-fetch databases when server address or protocol changes (debounced)
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Reset state when address changes
    if (serverAddress.length < 5) {
      setDatabases([]);
      setDb("");
      setDbFetched(false);
      return;
    }

    // Debounce the fetch - wait 800ms after user stops typing
    debounceTimer.current = setTimeout(() => {
      fetchDatabases(serverAddress, protocol);
    }, 800);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [serverAddress, protocol, fetchDatabases]);

  const handleServerAddressChange = (newAddress: string) => {
    // Remove any protocol if user pastes full URL
    const cleanAddress = newAddress.replace(/^https?:\/\//, "");
    setServerAddress(cleanAddress);
  };

  const toggleProtocol = () => {
    setProtocol(protocol === "http" ? "https" : "http");
  };

  const handleLogin = async () => {
    // Validation
    if (!serverAddress || !db || !username || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setError(null);
      const fullUrl = getFullUrl();
      console.log("🔄 Attempting to connect to:", fullUrl);
      await saveAndConnect({ url: fullUrl, db, username, password });
      console.log("✅ Login successful!");
      // Navigation will happen automatically via OdooContext
    } catch (err: any) {
      console.error("❌ Login failed:", err);
      const errorMessage =
        err.message || "Failed to connect. Please check your credentials.";
      setError(errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Connect to Odoo</Text>
          <Text style={styles.subtitle}>
            Enter your Odoo server details to get started
          </Text>
        </View>

        <View style={styles.form}>
          {/* Server URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Server Address</Text>
            <View style={styles.urlInputRow}>
              {/* Protocol Selector */}
              <TouchableOpacity
                style={styles.protocolButton}
                onPress={toggleProtocol}
              >
                <Text style={styles.protocolText}>{protocol}://</Text>
                <IconSymbol name="chevron.down" size={14} color="#666" />
              </TouchableOpacity>

              <View style={styles.urlInputWrapper}>
                <TextInput
                  style={[styles.input, styles.urlInput]}
                  placeholder="your-server.com:8069"
                  value={serverAddress}
                  onChangeText={handleServerAddressChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                {loadingDatabases && (
                  <ActivityIndicator
                    size="small"
                    color="#007AFF"
                    style={styles.urlLoadingIndicator}
                  />
                )}
              </View>
            </View>
            <Text style={styles.hintText}>
              {loadingDatabases
                ? "Fetching databases..."
                : dbFetched
                  ? `✓ Found ${databases.length} database${databases.length !== 1 ? "s" : ""}`
                  : "Tap protocol to switch • Databases will load automatically"}
            </Text>
          </View>

          {/* Database Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Database</Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                !dbFetched && styles.selectInputDisabled,
              ]}
              onPress={() =>
                dbFetched && databases.length > 0 && setShowDbPicker(true)
              }
              disabled={!dbFetched || databases.length === 0}
            >
              <Text style={db ? styles.selectText : styles.selectPlaceholder}>
                {db ||
                  (dbFetched ? "Select database" : "Fetch databases first")}
              </Text>
              <IconSymbol name="chevron.down" size={20} color="#666" />
            </TouchableOpacity>
            {dbFetched && databases.length > 0 && (
              <Text style={styles.hintTextSuccess}>
                ✓ {databases.length} database{databases.length > 1 ? "s" : ""}{" "}
                found
              </Text>
            )}
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@example.com"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Error Message */}
          {displayError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {displayError}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Connect</Text>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              💡 Tip: Make sure your Odoo server is accessible from your device
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Database Picker Modal */}
      <Modal visible={showDbPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Database</Text>
            <FlatList
              data={databases}
              keyExtractor={(item) => item}
              style={styles.dbList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dbItem, item === db && styles.dbItemSelected]}
                  onPress={() => {
                    setDb(item);
                    setShowDbPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dbItemText,
                      item === db && styles.dbItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === db && (
                    <IconSymbol name="checkmark" size={18} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDbPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  urlInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  urlInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  urlInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeftWidth: 0,
    paddingRight: 40, // Make room for loading indicator
  },
  urlLoadingIndicator: {
    position: "absolute",
    right: 12,
  },
  protocolButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    borderWidth: 1,
    borderColor: "#ddd",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 10,
    height: 48,
    gap: 4,
  },
  protocolText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  hintText: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },
  hintTextSuccess: {
    fontSize: 12,
    color: "#28a745",
    marginTop: 6,
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
    minHeight: 48,
  },
  selectInputDisabled: {
    backgroundColor: "#eee",
    opacity: 0.7,
  },
  selectText: {
    fontSize: 16,
    color: "#333",
  },
  selectPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#fee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#c00",
    fontSize: 14,
  },
  helpContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  helpText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxHeight: "60%",
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    textAlign: "center",
  },
  dbList: {
    maxHeight: 300,
  },
  dbItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dbItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  dbItemText: {
    fontSize: 16,
    color: "#333",
  },
  dbItemTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalCloseText: {
    fontSize: 16,
    color: "#666",
  },
});

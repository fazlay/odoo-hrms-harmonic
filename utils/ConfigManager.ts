// FILE 1: utils/ConfigManager.ts
// ==========================================
// Purpose: Securely store and retrieve Odoo configuration

import * as SecureStore from "expo-secure-store";

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  URL: "odoo_url",
  DB: "odoo_db",
  USERNAME: "odoo_username",
  PASSWORD: "odoo_password", // Stored securely
  IS_CONFIGURED: "odoo_is_configured",
};

export interface OdooConfigData {
  url: string;
  db: string;
  username: string;
  password: string;
}

class ConfigManager {
  /**
   * Save Odoo configuration to device
   */
  async saveConfig(config: OdooConfigData): Promise<void> {
    try {
      // Save non-sensitive data to AsyncStorage
      await AsyncStorage.multiSet([
        [KEYS.URL, config.url],
        [KEYS.DB, config.db],
        [KEYS.USERNAME, config.username],
        [KEYS.IS_CONFIGURED, "true"],
      ]);

      // Save password to SecureStore (encrypted)
      await SecureStore.setItemAsync(KEYS.PASSWORD, config.password);

      console.log("✅ Config saved successfully");
    } catch (error) {
      console.error("❌ Failed to save config:", error);
      throw new Error("Failed to save configuration");
    }
  }

  /**
   * Load Odoo configuration from device
   */
  async loadConfig(): Promise<OdooConfigData | null> {
    try {
      const isConfigured = await AsyncStorage.getItem(KEYS.IS_CONFIGURED);

      if (!isConfigured) {
        return null; // No config saved yet
      }

      const [url, db, username, password] = await Promise.all([
        AsyncStorage.getItem(KEYS.URL),
        AsyncStorage.getItem(KEYS.DB),
        AsyncStorage.getItem(KEYS.USERNAME),
        SecureStore.getItemAsync(KEYS.PASSWORD),
      ]);

      if (!url || !db || !username || !password) {
        return null; // Incomplete config
      }

      return { url, db, username, password };
    } catch (error) {
      console.error("❌ Failed to load config:", error);
      return null;
    }
  }

  /**
   * Check if configuration exists
   */
  async hasConfig(): Promise<boolean> {
    try {
      const isConfigured = await AsyncStorage.getItem(KEYS.IS_CONFIGURED);
      return isConfigured === "true";
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all saved configuration (logout)
   */
  async clearConfig(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.URL,
        KEYS.DB,
        KEYS.USERNAME,
        KEYS.IS_CONFIGURED,
      ]);
      await SecureStore.deleteItemAsync(KEYS.PASSWORD);

      console.log("✅ Config cleared successfully");
    } catch (error) {
      console.error("❌ Failed to clear config:", error);
      throw new Error("Failed to clear configuration");
    }
  }

  /**
   * Update specific config field
   */
  async updateUrl(url: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.URL, url);
  }

  async updateDb(db: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.DB, db);
  }

  async updateUsername(username: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.USERNAME, username);
  }

  async updatePassword(password: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.PASSWORD, password);
  }
}

// Export singleton instance
export const configManager = new ConfigManager();

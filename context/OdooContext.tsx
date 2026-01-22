// FILE 2: context/OdooContext.tsx (UPDATED)
// ==========================================
// Purpose: Load config from device instead of hardcoded

import React, { createContext, useContext, useEffect, useState } from "react";

import { configManager, OdooConfigData } from "@/utils/ConfigManager";
import OdooClient from "@/utils/OdooClient";

interface OdooContextType {
  client: OdooClient | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  uid: number | null;
  userName: string | null;
  isConfigured: boolean;
  reconnect: () => Promise<void>;
  logout: () => Promise<void>;
  saveAndConnect: (config: OdooConfigData) => Promise<void>;
}

const OdooContext = createContext<OdooContextType | undefined>(undefined);

export const OdooProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [client, setClient] = useState<OdooClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const connect = async (config: OdooConfigData) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsAuthenticated(false); // Reset before connecting

      console.log("🔄 Connecting to Odoo...");

      const odooClient = new OdooClient(config);
      const authenticatedUid = await odooClient.authenticate();

      setClient(odooClient);
      setUid(authenticatedUid);
      setIsAuthenticated(true);
      setError(null); // Clear any previous errors

      // Fetch user's display name
      try {
        const userInfo = await odooClient.call("res.users", "read", [
          [authenticatedUid],
          ["name"],
        ]);
        if (userInfo && userInfo[0]) {
          setUserName(userInfo[0].name);
        }
      } catch (e) {
        console.log("Could not fetch user name");
        setUserName(config.username); // Fallback to login username
      }

      console.log("✅ Connected! UID:", authenticatedUid);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to connect to Odoo";
      setError(errorMessage);
      setIsAuthenticated(false);
      setClient(null);
      setUid(null);
      console.error("❌ Connection failed:", errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveAndConnect = async (config: OdooConfigData) => {
    try {
      console.log("🔄 Attempting to connect before saving...");
      setIsLoading(true); // Keep loading state during entire process

      // Create client and authenticate
      const odooClient = new OdooClient(config);
      const authenticatedUid = await odooClient.authenticate();

      // Save config to device
      console.log("💾 Connection successful, saving config...");
      await configManager.saveConfig(config);

      // Fetch user's display name
      let fetchedUserName = config.username;
      try {
        const userInfo = await odooClient.call("res.users", "read", [
          [authenticatedUid],
          ["name"],
        ]);
        if (userInfo && userInfo[0]) {
          fetchedUserName = userInfo[0].name;
        }
      } catch (e) {
        console.log("Could not fetch user name, using login");
      }

      // Update ALL states together to avoid flickering
      setClient(odooClient);
      setUid(authenticatedUid);
      setUserName(fetchedUserName);
      setIsAuthenticated(true);
      setIsConfigured(true);
      setError(null);
      setIsLoading(false);

      console.log("✅ Config saved and user authenticated");
    } catch (err: any) {
      // Don't save config if connection failed
      console.error("❌ Connection failed, NOT saving config");
      const errorMessage = err.message || "Failed to connect to Odoo";
      setError(errorMessage);
      setIsConfigured(false);
      setIsAuthenticated(false);
      setClient(null);
      setUid(null);
      setUserName(null);
      setIsLoading(false);
      throw err;
    }
  };

  const reconnect = async () => {
    const config = await configManager.loadConfig();
    if (config) {
      await connect(config);
    } else {
      setError("No configuration found");
    }
  };

  const logout = async () => {
    await configManager.clearConfig();
    setClient(null);
    setIsAuthenticated(false);
    setIsConfigured(false);
    setUid(null);
    setUserName(null);
    console.log("✅ Logged out");
  };

  const initialize = async () => {
    try {
      setIsLoading(true);

      const hasConfig = await configManager.hasConfig();

      if (hasConfig) {
        const config = await configManager.loadConfig();
        if (config) {
          try {
            await connect(config);
            setIsConfigured(true); // Only set configured if connection succeeds
          } catch (err) {
            // Connection failed - clear bad config and show login
            console.error("❌ Saved config failed, clearing...");
            await configManager.clearConfig();
            setIsConfigured(false);
            setIsLoading(false);
          }
        } else {
          setIsConfigured(false);
          setIsLoading(false);
        }
      } else {
        setIsConfigured(false);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("❌ Initialization failed:", err);
      setIsConfigured(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <OdooContext.Provider
      value={{
        client,
        isAuthenticated,
        isLoading,
        error,
        uid,
        userName,
        isConfigured,
        reconnect,
        logout,
        saveAndConnect,
      }}
    >
      {children}
    </OdooContext.Provider>
  );
};

export const useOdoo = () => {
  const context = useContext(OdooContext);
  if (context === undefined) {
    throw new Error("useOdoo must be used within an OdooProvider");
  }
  return context;
};

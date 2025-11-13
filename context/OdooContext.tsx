// context/OdooContext.tsx
// Purpose: Share Odoo connection globally across all components

import React, { createContext, useContext, useEffect, useState } from "react";

import { ODOO_CONFIG } from "@/config/odoo.config";
import OdooClient from "@/utils/OdooClient";

interface OdooContextType {
  client: OdooClient | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  uid: number | null;
  reconnect: () => Promise<void>;
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

  const connect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Initializing Odoo connection...");

      const odooClient = new OdooClient(ODOO_CONFIG);
      const authenticatedUid = await odooClient.authenticate();

      setClient(odooClient);
      setUid(authenticatedUid);
      setIsAuthenticated(true);

      console.log("✅ Odoo connected! UID:", authenticatedUid);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to connect to Odoo";
      setError(errorMessage);
      setIsAuthenticated(false);
      console.error("❌ Odoo connection failed:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reconnect = async () => {
    console.log("🔄 Reconnecting to Odoo...");
    await connect();
  };

  useEffect(() => {
    connect();
  }, []);

  return (
    <OdooContext.Provider
      value={{
        client,
        isAuthenticated,
        isLoading,
        error,
        uid,
        reconnect,
      }}
    >
      {children}
    </OdooContext.Provider>
  );
};

// Custom hook to use Odoo context
export const useOdoo = () => {
  const context = useContext(OdooContext);
  if (context === undefined) {
    throw new Error("useOdoo must be used within an OdooProvider");
  }
  return context;
};

// hooks/usePartners.ts
// Purpose: Reusable hook for fetching partners with automatic loading states

import { useEffect, useState } from "react";

import { Partner } from "@/config/type";
import { useOdoo } from "@/context/OdooContext";
import { GetPartnersOptions, partnerService } from "@/services/partner.service";

interface UsePartnersResult {
  partners: Partner[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePartners = (
  options: GetPartnersOptions = {}
): UsePartnersResult => {
  const { client, isAuthenticated } = useOdoo();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    if (!client || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await partnerService.getPartners(client, options);
      setPartners(data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch partners";
      setError(errorMessage);
      console.error("❌ Error fetching partners:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [client, isAuthenticated, JSON.stringify(options)]);

  return {
    partners,
    isLoading,
    error,
    refetch: fetchPartners,
  };
};

// Specific hook for companies only
export const useCompanies = (limit?: number): UsePartnersResult => {
  return usePartners({ isCompany: true, limit });
};

// Specific hook for individuals only
export const useIndividuals = (limit?: number): UsePartnersResult => {
  return usePartners({ isCompany: false, limit });
};

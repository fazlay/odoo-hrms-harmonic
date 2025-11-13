import React from "react";
import { View } from "react-native";

import { PartnerList } from "@/components/Partner/PartnerList";
import { usePartners } from "@/hooks/usePartners";

export default function PartnersScreen() {
  const { partners, isLoading, error } = usePartners({
    isCompany: true,
    limit: 10,
  });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <PartnerList partners={partners} loading={isLoading} error={error} />
    </View>
  );
}

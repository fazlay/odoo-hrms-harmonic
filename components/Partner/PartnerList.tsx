import React from "react";
import { FlatList, Text } from "react-native";

import { Partner } from "@/config/type";

import { PartnerCard } from "./PartnerCard";

type PartnerListProps = {
  partners: Partner[];
  loading?: boolean;
  error?: string | null;
};

export const PartnerList = ({ partners, loading, error }: PartnerListProps) => {
  if (loading) {
    return <Text>Loading partners...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (!partners.length) {
    return <Text>No partners found.</Text>;
  }

  return (
    <FlatList
      data={partners}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <PartnerCard partner={item} />}
    />
  );
};

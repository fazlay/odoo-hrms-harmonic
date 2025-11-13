import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Partner } from "@/config/type";

type PartnerCardProps = {
  partner: Partner;
};

export const PartnerCard = ({ partner }: PartnerCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{partner.name}</Text>
      {partner.email && <Text style={styles.email}>{partner.email}</Text>}
      {partner.phone && <Text style={styles.phone}>{partner.phone}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  phone: {
    fontSize: 14,
    color: "#666",
  },
});

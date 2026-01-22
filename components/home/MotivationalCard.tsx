// components/home/MotivationalCard.tsx
// Daily motivational quote card

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const quotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  { text: "Your time is limited, don't waste it.", author: "Steve Jobs" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Work smarter, not harder.", author: "Allen F. Morgenstern" },
  {
    text: "Small daily improvements lead to staggering results.",
    author: "Robin Sharma",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Success is the sum of small efforts repeated daily.",
    author: "Robert Collier",
  },
  {
    text: "Productivity is never an accident. It is always the result of commitment.",
    author: "Paul J. Meyer",
  },
  {
    text: "Time is what we want most, but what we use worst.",
    author: "William Penn",
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
  },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  {
    text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.",
    author: "Stephen King",
  },
];

export function MotivationalCard() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // Pick a "random" quote based on the day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    setQuote(quotes[dayOfYear % quotes.length]);
  }, []);

  return (
    <View style={[styles.card, { backgroundColor: `${theme.primary}10` }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="bulb" size={24} color={theme.primary} />
      </View>
      <View style={styles.textContainer}>
        <ThemedText style={styles.quoteText}>"{quote.text}"</ThemedText>
        <ThemedText style={[styles.authorText, { color: theme.icon }]}>
          — {quote.author}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 4,
  },
  authorText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

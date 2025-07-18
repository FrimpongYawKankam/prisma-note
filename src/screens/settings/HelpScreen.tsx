import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext'; // ✅ useTheme import
import { safeNavigateBack } from '../../utils/navigation';

export default function HelpScreen() {
  const { theme } = useTheme(); // ✅ Get current theme
  const isDark = theme === 'dark';
  const router = useRouter();   // ✅ Router for back navigation

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => safeNavigateBack('/')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={isDark ? '#64ffda' : '#00796b'} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: isDark ? '#64ffda' : '#00796b' }]}>Help & FAQs</Text>
      <Text style={[styles.text, { color: isDark ? '#ccc' : '#333' }]}>
        • To create a note, tap the "+" icon.{"\n"}
        • Swipe left on a note to delete it.{"\n"}
        • Tap the pencil icon to edit a note.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});

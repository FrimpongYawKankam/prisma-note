import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext'; // ✅ Custom theme context
import { safeNavigateBack } from '../../utils/navigation';

export default function AboutScreen() {
  const { theme } = useTheme(); // ✅ Get current theme
  const isDark = theme === 'dark';
  const router = useRouter();   // ✅ For back navigation

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* ✅ Back Button */}
      <TouchableOpacity onPress={() => safeNavigateBack('/')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={isDark ? '#64ffda' : '#00796b'} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: isDark ? '#64ffda' : '#00796b' }]}>About PrismaNote</Text>
      <Text style={[styles.text, { color: isDark ? '#ccc' : '#333' }]}>
        PrismaNote is a lightweight, minimal Notion-style note-taking app built with Expo and React Native.
      </Text>
      <Text style={[styles.text, { color: isDark ? '#ccc' : '#333' }]}>
        It allows you to create, edit, and manage notes with a clean and simple interface.
        And also helps plan your day with a calendar and reminders.
        Hence the name PrismaNote.
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

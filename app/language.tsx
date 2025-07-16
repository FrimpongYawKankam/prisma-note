import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useRouter } from 'expo-router';

export default function LanguageScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  // For demonstration, only English is available
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={22} color={isDark ? '#aaa' : '#555'} />
        <Text style={[styles.backText, { color: isDark ? '#aaa' : '#555' }]}>Back</Text>
      </TouchableOpacity>
      <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>Select Language</Text>
      <View style={styles.list}>
        <TouchableOpacity style={styles.languageRow} disabled>
          <Ionicons name="checkmark-circle" size={20} color="#00796b" />
          <Text style={[styles.languageText, { color: isDark ? '#fff' : '#000' }]}>English</Text>
        </TouchableOpacity>
        {/* Add more languages here */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 15, marginLeft: 8 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  list: { gap: 16 },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: '#1e1e1e',
    borderBottomWidth: 1,
  },
  languageText: { fontSize: 16, marginLeft: 12 },
});
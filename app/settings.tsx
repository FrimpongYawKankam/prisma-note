import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity
        style={styles.option}
        onPress={() => alert('Toggle Dark Mode coming soon!')}
      >
        <Ionicons name="moon-outline" size={22} color="#fff" />
        <Text style={styles.optionText}>Dark Mode</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => alert('Account Settings coming soon!')}
      >
        <Ionicons name="person-outline" size={22} color="#fff" />
        <Text style={styles.optionText}>Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={22} color="#fff" />
        <Text style={styles.optionText}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 14,
  },
});

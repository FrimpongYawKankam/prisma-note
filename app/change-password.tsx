import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';

export default function ChangePasswordScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    // TODO: Add your password change logic here (API call, etc.)
    Alert.alert('Success', 'Password changed successfully!');
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back-outline" size={22} color={isDark ? '#aaa' : '#555'} />
        <Text style={[styles.backText, { color: isDark ? '#aaa' : '#555' }]}>Back</Text>
      </TouchableOpacity>
      <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>Change Password</Text>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#333' : '#ccc' }]}
          placeholder="Current Password"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#333' : '#ccc' }]}
          placeholder="New Password"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#333' : '#ccc' }]}
          placeholder="Confirm New Password"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 15, marginLeft: 8 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  form: { gap: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: '#00796b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ModernDialog } from '../../components/ui/ModernDialog';
import { useTheme } from '../../context/ThemeContext';

export default function ChangePasswordScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    isSuccess: false
  });

  const showDialog = (title: string, message: string, isSuccess: boolean = false) => {
    setDialogConfig({ title, message, isSuccess });
    setDialogVisible(true);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showDialog('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showDialog('Error', 'New passwords do not match.');
      return;
    }
    // TODO: Add your password change logic here (API call, etc.)
    showDialog('Success', 'Password changed successfully!', true);
  };

  const handleDialogClose = () => {
    setDialogVisible(false);
    if (dialogConfig.isSuccess) {
      router.back();
    }
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
        <TouchableOpacity style={styles.changeBtn} onPress={handleChangePassword}>
          <Text style={styles.changeBtnText}>Change Password</Text>
        </TouchableOpacity>
      </View>
      {/* Dialog for error/success messages */}
      <ModernDialog
        visible={dialogVisible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        buttons={[
          {
            text: 'OK',
            onPress: handleDialogClose,
            style: dialogConfig.isSuccess ? 'default' : 'default'
          }
        ]}
        onClose={handleDialogClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  form: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  changeBtn: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  changeBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

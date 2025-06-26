import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext'; // ✅ Use custom theme

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ username: '', email: '' });
  const { theme } = useTheme(); // ✅ access custom theme
  const { logout, user } = useAuth();
  const isDark = theme === 'dark';
  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        setUserData({
          username: user.fullName || user.username || '',
          email: user.email
        });
      } else {
        try {
          const userFromStorage = await AsyncStorage.getItem('user');
          if (userFromStorage) {
            const parsedUser = JSON.parse(userFromStorage);
            setUserData({
              username: parsedUser.fullName || parsedUser.username || '',
              email: parsedUser.email
            });
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };
    fetchUser();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={isDark ? '#64ffda' : '#00796b'} />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <View style={[styles.avatarText, { backgroundColor: isDark ? '#1a1a1a' : '#eee' }]}>
          <Text style={[styles.avatarInitials, { color: '#2e7d32' }]}>
            {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>
          {userData.username || 'Username'}
        </Text>
        <Text style={[styles.email, { color: isDark ? '#aaa' : '#555' }]}>
          {userData.email || 'user@example.com'}
        </Text>
      </View>

      <View style={[styles.section, { borderTopColor: isDark ? '#444' : '#ccc' }]}>
        <Text style={[styles.label, { color: '#2e7d32' }]}>App Version</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>1.0.0</Text>
      </View>

      <View style={[styles.section, { borderTopColor: isDark ? '#444' : '#ccc' }]}>
        <Text style={[styles.label, { color: '#2e7d32' }]}>Status</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>Active</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarText: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
  },
  section: {
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  logoutBtn: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    backgroundColor: '#ff5252', // Solid red background
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

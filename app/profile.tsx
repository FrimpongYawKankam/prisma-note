import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ModernDialog } from '../src/components/ui/ModernDialog';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { safeNavigateBack } from '../src/utils/navigation';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ fullName: '', email: '' });
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { theme } = useTheme();
  const { logout, user } = useAuth();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        setUserData({
          fullName: user.fullName || '',
          email: user.email,
        });
      } else {
        try {
          const userFromStorage = await AsyncStorage.getItem('user');
          if (userFromStorage) {
            const parsedUser = JSON.parse(userFromStorage);
            setUserData({
              fullName: parsedUser.fullName || '',
              email: parsedUser.email,
            });
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };
    fetchUser();
  }, [user]);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => safeNavigateBack('/')}>
        <Ionicons name="arrow-back" size={24} color={isDark ? '#64ffda' : '#00796b'} />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <View style={[styles.avatarIcon, { backgroundColor: isDark ? '#1a1a1a' : '#eee' }]}>
          <Ionicons name="person-circle" size={90} color={isDark ? '#64ffda' : '#00796b'} />
        </View>
        <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>
          {userData.fullName || 'Full Name'}
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

      <ModernDialog
        visible={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to log out?"
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowLogoutDialog(false),
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => {
              setShowLogoutDialog(false);
              confirmLogout();
            },
          },
        ]}
        onClose={() => setShowLogoutDialog(false)}
      />
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
  avatarIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    backgroundColor: '#ff5252',
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
    marginLeft: 8,
  },
});
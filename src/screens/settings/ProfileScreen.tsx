import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ModernDialog } from '../../components/ui/ModernDialog';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { safeNavigateBack } from '../../utils/navigation';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ fullName: '', email: '' });
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { theme, colors } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header with Back Button and Title */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => safeNavigateBack('/')}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info Section */}
        <View style={styles.section}>
          <View style={[styles.profileCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person-circle-outline" size={64} color={colors.primary} />
            </View>
            <Text style={[styles.userName, { color: isDark ? '#fff' : '#000' }]}>
              {userData.fullName || 'Full Name'}
            </Text>
            <Text style={[styles.userEmail, { color: isDark ? '#aaa' : '#666' }]}>
              {userData.email || 'user@example.com'}
            </Text>
          </View>
        </View>

        {/* Account Details Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Account Details
          </Text>
          
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#000' }]}>
                App Version
              </Text>
              <Text style={[styles.infoText, { color: isDark ? '#aaa' : '#666' }]}>
                Version 1.0.0
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#000' }]}>
                Account Status
              </Text>
              <Text style={[styles.infoText, { color: isDark ? '#aaa' : '#666' }]}>
                Active
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.logoutCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]} onPress={handleLogout}>
            <View style={[styles.logoutIconContainer, { backgroundColor: '#ff5252' + '20' }]}>
              <Ionicons name="log-out-outline" size={20} color="#ff5252" />
            </View>
            <View style={styles.logoutContent}>
              <Text style={[styles.logoutTitle, { color: '#ff5252' }]}>
                Logout
              </Text>
              <Text style={[styles.logoutText, { color: isDark ? '#aaa' : '#666' }]}>
                Sign out of your account
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '500',
    lineHeight: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    lineHeight: 30,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  logoutCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  logoutContent: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  logoutText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

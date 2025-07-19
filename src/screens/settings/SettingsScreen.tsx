import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { safeNavigateBack } from '../../utils/navigation';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, theme === 'dark' ? styles.darkBg : styles.lightBg]}>
      <Text style={[styles.header, theme === 'dark' ? styles.darkText : styles.lightText]}>
        Settings
      </Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Shortcut */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/profile')}>
            <Ionicons name="person-circle-outline" size={22} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.rowText, theme === 'dark' ? styles.darkText : styles.lightText]}>
              Profile
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme === 'dark' ? '#aaa' : '#555'} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, theme === 'dark' ? styles.darkSubText : styles.lightSubText]}>
            Appearance
          </Text>
          <TouchableOpacity style={styles.row} onPress={toggleTheme}>
            <Ionicons name="moon-outline" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.rowText, theme === 'dark' ? styles.darkText : styles.lightText]}>
              {theme === 'dark' ? 'Dark Mode (On)' : 'Dark Mode (Off)'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme === 'dark' ? '#aaa' : '#555'} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, theme === 'dark' ? styles.darkSubText : styles.lightSubText]}>
            Language
          </Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/language')}
          >
            <Ionicons name="language-outline" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.rowText, theme === 'dark' ? styles.darkText : styles.lightText]}>
              English
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme === 'dark' ? '#aaa' : '#555'} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, theme === 'dark' ? styles.darkSubText : styles.lightSubText]}>
            Account
          </Text>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/change-password')}>
            <Ionicons name="key-outline" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.rowText, theme === 'dark' ? styles.darkText : styles.lightText]}>
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme === 'dark' ? '#aaa' : '#555'} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* Other Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, theme === 'dark' ? styles.darkSubText : styles.lightSubText]}>
            Other
          </Text>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/help')}>
            <Ionicons name="help-circle-outline" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
            <Text style={[styles.rowText, theme === 'dark' ? styles.darkText : styles.lightText]}>
              Help & Support
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme === 'dark' ? '#aaa' : '#555'} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* Back */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => safeNavigateBack('/')}>
            <Ionicons name="arrow-back-outline" size={18} color={theme === 'dark' ? '#aaa' : '#555'} />
            <Text style={[styles.backText, theme === 'dark' ? styles.darkSubText : styles.lightSubText]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  darkBg: {
    backgroundColor: '#0d0d0d',
  },
  lightBg: {
    backgroundColor: '#fefefe',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    paddingVertical: 20,
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#000',
  },
  darkSubText: {
    color: '#aaa',
  },
  lightSubText: {
    color: '#555',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: '#1e1e1e',
    borderBottomWidth: 1,
  },
  rowText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  arrow: {
    marginLeft: 'auto',
  },
  footer: {
    marginTop: 40,
    borderTopColor: '#1e1e1e',
    borderTopWidth: 1,
    paddingTop: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: { fontSize: 15,
    marginLeft: 8,
  },
});

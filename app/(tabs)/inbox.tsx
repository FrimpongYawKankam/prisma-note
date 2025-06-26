import { useTheme } from '../../src/context/ThemeContext'; // ✅ Use your custom theme context
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function InboxScreen() {
  const [userData, setUserData] = useState({ username: '' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) setUserData(JSON.parse(user));
    };
    fetchUser();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Text style={[styles.headerText, { color: isDark ? '#fff' : '#111' }]}>
        Hello, <Text style={{ color: '#64ffda' }}>{userData.username || 'User'}</Text>
      </Text>
      <Text style={[styles.subText, { color: isDark ? '#aaa' : '#555' }]}>
        Here's your activity log and inbox 💌
      </Text>

      <View style={styles.inboxBox}>
        <Ionicons
          name="mail-open-outline"
          size={64}
          color={isDark ? '#666' : '#999'}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: isDark ? '#eee' : '#222' }]}>No New Messages</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#999' : '#666' }]}>
          Your inbox is clear. Notifications and shared notes will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    marginBottom: 40,
  },
  inboxBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
});

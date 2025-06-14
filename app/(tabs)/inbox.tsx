import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function InboxScreen() {
  const [userData, setUserData] = useState({ username: '' });

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) setUserData(JSON.parse(user));
    };
    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        Hello, <Text style={styles.highlight}>{userData.username || 'User'}</Text>
      </Text>
      <Text style={styles.subText}>Here's your activity log and inbox 💌</Text>

      <View style={styles.inboxBox}>
        <Ionicons name="mail-open-outline" size={64} color="#888" style={styles.icon} />
        <Text style={styles.title}>No New Messages</Text>
        <Text style={styles.subtitle}>
          Your inbox is clear. Notifications and shared notes will appear here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  highlight: {
    color: '#64ffda',
  },
  subText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 40,
  },
  inboxBox: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: -40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
});

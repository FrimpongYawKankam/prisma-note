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

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ username: '', email: '' });

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) setUserData(JSON.parse(user));
    };
    fetchUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#64ffda" />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <View style={styles.avatarText}>
          <Text style={styles.avatarInitials}>
            {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{userData.username || 'Username'}</Text>
        <Text style={styles.email}>{userData.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>App Version</Text>
        <Text style={styles.value}>1.0.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>Active</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarInitials: {
    fontSize: 36,
    color: '#64ffda',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#aaa',
  },
  section: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  label: {
    fontSize: 14,
    color: '#64ffda',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#fff',
  },
});

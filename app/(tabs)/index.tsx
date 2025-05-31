import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState({ username: '', email: '' });

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear(); // Clear user session
    Alert.alert('Logged Out', 'You have been logged out successfully.');
    router.push('/login'); // Redirect to login page
  };

  return (
    <View style={styles.container}>
      {/* Header with 3-dotted menu */}
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Menu Dropdown */}
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => Alert.alert('Profile', `Username: ${userData.username}\nEmail: ${userData.email}`)}>
            <Text style={styles.menuItem}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.menuItem}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.message}>Welcome to the Home Screen!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 5,
    padding: 10,
    zIndex: 10,
  },
  menuItem: {
    color: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});
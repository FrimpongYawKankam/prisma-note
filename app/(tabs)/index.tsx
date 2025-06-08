import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState({ username: '', email: '' });

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
    await AsyncStorage.clear();
    Alert.alert('Logged Out', 'You have been logged out successfully.');
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        {/* Logo and header */}
        <View style={styles.iconTopLeftContainer}>
          <Image
            source={require('../../assets/images/logo.jpeg')}
            style={styles.logo}
          />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Think it. Make it.</Text>
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Ionicons name="ellipsis-vertical" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subText}>Welcome to your PrismaNote Home</Text>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    width: '100%',
    backgroundColor: '#18181a',
    borderRadius: 0,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    justifyContent: 'flex-start',
  },
  iconTopLeftContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logo: {
    width: 75,
    height: 75,
    resizeMode: 'contain',
    backgroundColor: '#111',
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'left',
  },
  subText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'left',
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: 32,
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
    color: '#fff',
    fontSize: 18,
  },
});
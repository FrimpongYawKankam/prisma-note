import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const { email: storedEmail, password: storedPassword } = JSON.parse(storedUser);
        if (email === storedEmail && password === storedPassword) {
          alert('Login successful!');
          router.push('/(tabs)');
        } else {
          alert('Invalid email or password');
        }
      } else {
        alert('No user found. Please sign up first.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    alert('Google Login Pressed');
  };

  const handleMicrosoftLogin = () => {
    alert('Microsoft Login Pressed');
  };

  const handleAppleLogin = () => {
    alert('Apple ID Login Pressed');
  };

  return (
    <View style={styles.container}>
      <Text style = {styles.headerText}>Think it. Make it </Text>
      <Text style={styles.subText}>Login to your PrismaNote account</Text>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#808080"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#808080"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />

      {/* Divider */}
      <Text style={styles.orText}>OR</Text>

      {/* Google Login */}
      <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
        <FontAwesome name="google" size={24} color="#DB4437" />
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Microsoft Login */}
      <TouchableOpacity style={styles.socialButton} onPress={handleMicrosoftLogin}>
        <MaterialCommunityIcons name="microsoft" size={24} color="#0078D4" />
        <Text style={styles.socialText}>Continue with Microsoft</Text>
      </TouchableOpacity>

      {/* Apple ID Login */}
      <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin}>
        <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
        <Text style={styles.socialText}>Continue with Apple</Text>
      </TouchableOpacity>

      {/* Signup Option */}
      <Text style={styles.orText}>Don't have an account?</Text>
      <Button title="Sign Up" onPress={() => router.push('/signup')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#1a1a1a',
    color: '#FFFFFF',
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  orText: {
    color: '#FFFFFF',
    marginVertical: 15,
    fontSize: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  socialText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  headerText: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
    
  },
  subText: {
    fontSize: 25,
    color: '#808080',
    marginBottom: 20,
    textAlign: 'left',
    width: '100%',
    
  },
});
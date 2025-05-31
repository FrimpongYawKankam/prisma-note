import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (name && email && password) {
      // Save user data to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify({ email, password }));
      alert('Signup successful!');
      router.push('/login'); // Redirect to the login page after signup
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#808080"
        value={name}
        onChangeText={setName}
      />
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
      <Button title="Sign Up" onPress={handleSignup} />

      {/* Divider */}
      <Text style={styles.orText}>OR</Text>

      {/* Login Button */}
      <Button title="Login" onPress={() => router.push('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Black background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    width: '80%',
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
});
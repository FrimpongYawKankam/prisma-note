import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordWarning, setPasswordWarning] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{6,}$/;
    return regex.test(pwd);
  };

  const handleSignup = async () => {
    if (username && email && password) {
      if (!validatePassword(password)) {
        Alert.alert('Invalid Password', 'Please enter a valid password.');
        return;
      }
      const userData = { username, email, password };
      try {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        Alert.alert('Signup successful', 'You can now log in.');
        router.push('/login');
      } catch (error) {
        Alert.alert('Error', 'Failed to save user data.');
      }
    } else {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#808080"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#808080"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Password"
          placeholderTextColor="#808080"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (text.length > 0 && !validatePassword(text)) {
              setPasswordWarning(
                'Password must be at least 6 characters long and contain at least one digit, one lowercase letter, one uppercase letter, and one special character (@#$%^&+=!)'
              );
            } else {
              setPasswordWarning('');
            }
          }}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </View>
      {passwordWarning ? (
        <Text style={styles.warningText}>{passwordWarning}</Text>
      ) : null}

      <Button title="Sign Up" onPress={handleSignup} color="#1E90FF" />

      <Text style={styles.orText}>OR</Text>

      <Button title="Login" onPress={() => router.push('/login')} color="#888" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 16,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  warningText: {
    color: '#ff5252',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'left',
    width: '100%',
  },
  orText: {
    marginVertical: 16,
    color: '#fff',
    fontSize: 16,
  },
});

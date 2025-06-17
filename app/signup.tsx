import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordWarning, setPasswordWarning] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password: string) => {
    const pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{6,}$/;
    return pattern.test(password);
  };

  const handleSignup = async () => {
    if (username && email && password) {
      if (!validatePassword(password)) {
        Alert.alert('Weak Password', 'Please enter a stronger password.');
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('@/assets/images/auth-bg-2.png')}
          style={styles.image}
        />

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
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#ccc"
              style={{ marginLeft: -35 }}
            />
          </TouchableOpacity>
        </View>

        {passwordWarning !== '' && (
          <Text style={styles.warning}>{passwordWarning}</Text>
        )}

        <Button title="Sign Up" onPress={handleSignup} color="#1E90FF" />

        <Text style={styles.orText}>OR</Text>

        <Button
          title="Login"
          onPress={() => router.push('/login')}
          color="#888"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: 260,
    height: 260,
    resizeMode: 'contain',
    marginTop: 20,
    marginBottom: 10,
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
    paddingRight: 12,
    marginBottom: 16,
  },
  warning: {
    color: 'red',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  orText: {
    marginVertical: 16,
    color: '#fff',
    fontSize: 16,
  },
});

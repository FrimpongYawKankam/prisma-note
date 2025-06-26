import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MessageBox from '../../components/ui/MessageBox';

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordWarning, setPasswordWarning] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('error');

  const validatePassword = (text: string) => {
    const pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{6,}$/;
    return pattern.test(text);
  };

  const handleSignup = async () => {
    if (!username || !email || !password) {
      setErrorMessage('Please fill in all fields.');
      setMessageType('error');
      return;
    }
    if (!validatePassword(password)) {
      setErrorMessage('Please enter a strong password.');
      setMessageType('error');
      return;
    }
    const userData = { username, email, password };
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setErrorMessage('Signup successful. You can now log in.');
      setMessageType('success');
      setTimeout(() => router.push('/login'), 1500);
    } catch (error) {
      setErrorMessage('Failed to save user data.');
      setMessageType('error');
    }
  };
  return (
    <View style={styles.container}>
      <MessageBox message={errorMessage} type={messageType} />
      
      <Image
        source={require('../../../assets/images/notion-desk.png')}
        style={styles.image}
        resizeMode="contain"
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
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={{ flex: 1, color: '#fff' }}
          placeholder="Password"
          placeholderTextColor="#808080"
          secureTextEntry={secureText}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (text.length > 0 && !validatePassword(text)) {
              setPasswordWarning(
                'Password must be at least 6 characters long.\nMust contain at least one digit, one lowercase letter, one uppercase letter, and one special character (@#$%^&+=!)'
              );
              setErrorMessage('Your password does not meet the requirements');
              setMessageType('info');
            } else {
              setPasswordWarning('');
              setErrorMessage('');
            }
          }}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Ionicons
            name={secureText ? 'eye-off' : 'eye'}
            size={24}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {passwordWarning ? (
        <Text style={styles.warning}>{passwordWarning}</Text>
      ) : null}

      {/* Sign Up Button with Icon */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <View style={styles.buttonContent}>
          <Ionicons name="person-add-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Sign Up</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.orText}>OR</Text>

      {/* Login Button with Icon */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
        <View style={styles.buttonContent}>
          <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Login</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 1.0,
    height: width * 0.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
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
    paddingHorizontal: 16,
    height: 48,
  },
  warning: {
    color: '#FF6347',
    fontSize: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  orText: {
    marginVertical: 16,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

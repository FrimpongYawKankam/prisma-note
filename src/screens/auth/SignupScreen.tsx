import { Ionicons } from '@expo/vector-icons';
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
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
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
  const { register } = useAuth();
    const handleSignup = async () => {
    // Reset error message first
    setErrorMessage('');
    
    if (!fullName || !email || !password) {
      // Use timeout to avoid state updates during render
      setTimeout(() => {
        setErrorMessage('Please fill in all fields.');
        setMessageType('error');
      }, 0);
      return;
    }
    
    if (!validatePassword(password)) {
      setTimeout(() => {
        setErrorMessage('Please enter a strong password.');
        setMessageType('error');
      }, 0);
      return;
    }
    
    try {
      // Call the register API
      await register(fullName, email, password);
      
      // Success - use requestAnimationFrame to schedule after render
      requestAnimationFrame(() => {
        setErrorMessage('Signup successful! Please check your email for verification code.');
        setMessageType('success');
        
        // Redirect to OTP verification screen after a delay
        setTimeout(() => router.push({
          pathname: '/otp-verification',
          params: { email }
        }), 1500);
      });
    } catch (error: any) {
      // Handle different error types
      let message = 'An unexpected error occurred';
      
      if (error.response) {
        message = error.response.data?.message || 'Registration failed';
      } else if (error.request) {
        message = 'Network error. Please check your connection.';
      }
      
      // Schedule state update safely
      requestAnimationFrame(() => {
        setErrorMessage(message);
        setMessageType('error');
      });
      
      console.error('Error during signup:', error);
    }
  };
  return (
    <View style={styles.container}>
      {/* add keyboardoidnig view to allow user to hide keyboard when clicking on another part of the screen */}
      <MessageBox message={errorMessage} type={messageType} />
      
      <Image
        source={require('../../../assets/images/notion-desk.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#808080"
        value={fullName}
        onChangeText={setFullName}
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

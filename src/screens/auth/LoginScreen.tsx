import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MessageBox from '../../components/ui/MessageBox';
import { useAuth } from '../../context/AuthContext';

const { height, width } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordWarning, setPasswordWarning] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('error');

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '105342935662-ej0kqvn1h6hsm7lifo1jlflh2ud1basj.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'prismanote',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setErrorMessage('Google Login Success!');
      setMessageType('success');
      // router.push('/(tabs)');
    }
  }, [response]);

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{6,}$/;
    return regex.test(pwd);
  };
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setErrorMessage('');
      setMessageType('info');
      
      // Validate inputs
      if (!email || !password) {
        setErrorMessage('Please enter both email and password');
        setMessageType('error');
        return;
      }
      
      // Call the login API
      await login(email, password);
      
      // Success - JWT will be stored by the authService
      setErrorMessage('Login successful!');
      setMessageType('success');
      setTimeout(() => router.push('/(tabs)'), 1000);
    } catch (error: any) {
      // Handle different error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const message = error.response.data.message || 'Invalid credentials';
        setErrorMessage(message);
      } else if (error.request) {
        // The request was made but no response was received
        setErrorMessage('Network error. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setErrorMessage('An unexpected error occurred');
      }
      setMessageType('error');
      console.error('Error during login:', error);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  const handleMicrosoftLogin = () => {
    setErrorMessage('Microsoft Login functionality coming soon');
    setMessageType('info');
  };

  const handleAppleLogin = () => {
    setErrorMessage('Apple ID Login functionality coming soon');
    setMessageType('info');
  };

  const handleForgotPassword = () => {
    setErrorMessage('Please contact support or check your email to reset your password.');
    setMessageType('info');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <MessageBox message={errorMessage} type={messageType} />
      <KeyboardAvoidingView
        style={styles.outerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoTopContainer}>
            <Image
              source={require('../../../assets/images/logo.jpeg')}
              style={styles.logo}
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.headerText}>Think it. Make it.</Text>
            <Text style={styles.subText}>Log into your PrismaNote account</Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="white"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder=""
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (text.length > 0 && !validatePassword(text)) {
                    setPasswordWarning(
                      "Password must be at least 6 characters long and contain at least one digit, one lowercase letter, one uppercase letter, and one special character (@#$%^&+=!)"
                    );
                    setErrorMessage('Your password does not meet the requirements');
                    setMessageType('info');
                  } else {
                    setPasswordWarning('');
                    setErrorMessage('');
                  }
                }}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {passwordWarning ? (
              <Text style={styles.passwordWarning}>{passwordWarning}</Text>
            ) : null}

            <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* ✅ Login Button with Icon */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <View style={styles.buttonContent}>
                <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.icon} />
                <Text style={styles.loginButtonText}>Log in</Text>
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialIconButton} onPress={handleGoogleLogin}>
                <Ionicons name="logo-google" size={32} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIconButton} onPress={handleAppleLogin}>
                <Ionicons name="logo-apple" size={32} color="#111" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIconButton} onPress={handleMicrosoftLogin}>
                <Ionicons name="logo-microsoft" size={32} color="#0078D4" />
              </TouchableOpacity>
            </View>

            {/* Signup Option */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? Register for free</Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By continuing, you acknowledge that you understand and agree to the Terms & condition and Privacy Policy
            </Text>
            <View style={styles.bottomLinksRow}>
              <TouchableOpacity>
                <Text style={styles.bottomLink}>Privacy & terms</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.bottomLink}>Need help?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: 'black',
    width: width,
    height: height,
    justifyContent: 'flex-start',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  logoTopContainer: {
    alignItems: 'flex-start',
    marginTop: 16,
    marginLeft: 32,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    width: '100%',
    backgroundColor: 'black',
    padding: 32,
    paddingTop: 8,
  },
  logo: {
    width: 100,
    height: 75,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  headerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    height: 48,
    backgroundColor: '#232326',
    color: '#fff',
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222227',
    fontSize: 16,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  passwordWarning: {
    color: '#ff5252',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#2f80ed',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#232326',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#888',
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 18,
    paddingHorizontal: 8,
  },
  socialIconButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 80,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  signupContainer: {
    marginTop: 18,
    alignItems: 'center',
  },
  signupText: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 4,
  },
  signupLink: {
    color: '#2f80ed',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 4,
  },
  termsText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  bottomLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bottomLink: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginHorizontal: 12,
  },
});

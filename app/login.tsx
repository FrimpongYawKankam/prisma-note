import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');

  // Google Auth setup with all required client IDs
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '105342935662-ej0kqvn1h6hsm7lifo1jlflh2ud1basj.apps.googleusercontent.com',
    iosClientId: '105342935662-e0cjrhh4ovf11gg9fm5bvko0hi232j0a.apps.googleusercontent.com',
    androidClientId: '105342935662-ein86altf32t085s7d7v7ot8e25hn2gn.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      alert('Google Login Success!\nAccess Token: ' + authentication?.accessToken);
      // router.push('/(tabs)');
    }
  }, [response]);

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
    promptAsync();
  };

  const handleMicrosoftLogin = () => {
    alert('Microsoft Login Pressed');
  };

  const handleAppleLogin = () => {
    alert('Apple ID Login Pressed');
  };

  const handleForgotPassword = () => {
    alert('Forgot Password? Please contact support or check your email to reset your password.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.outerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          {/* Custom logo at the top left */}
          <View style={styles.iconTopLeftContainer}>
            <Image
              source={require('../assets/images/logo.jpeg')}
              style={styles.logo}
            />
          </View>
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
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log in</Text>
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
            <Text style={styles.signupText}>Don’t have an account? Register for free</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Terms and Help */}
          <Text style={styles.termsText}>
            By continuing, you  acknowledge that you understand and agree to the Terms & condition and Privacy Policy
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: 'black',
    width: width,
    height: height,
    justifyContent: 'flex-start',
  },
  card: {
    flex: 1,
    width: '100%',
    backgroundColor: 'black',
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
    width: 100,
    height: 75,
    resizeMode: 'contain',
    backgroundColor: 'black',
    borderRadius: 12,
    color: '#fff',
  },
  headerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'left',
  },
  subText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'left',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
    marginTop: 12,
    textAlign: 'left',
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
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
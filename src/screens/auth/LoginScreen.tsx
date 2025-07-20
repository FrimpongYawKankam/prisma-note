import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernInput } from '../../components/ui/ModernInput';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography } from '../../styles/tokens';

const { height, width } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('error');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation individual checks
  const passwordChecks = {
    minLength: password.length >= 6,
    hasNumber: /[0-9]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasSpecialChar: /[@#$%^&+=!]/.test(password),
  };

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
    const checks = {
      minLength: pwd.length >= 6,
      hasNumber: /[0-9]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      hasSpecialChar: /[@#$%^&+=!]/.test(pwd),
    };
    return Object.values(checks).every(Boolean);
  };

  const renderPasswordRequirement = (text: string, isValid: boolean) => (
    <View key={text} style={styles.requirementRow}>
      <Ionicons 
        name={isValid ? "checkmark-circle" : "radio-button-off"} 
        size={16} 
        color={isValid ? colors.primary : colors.textMuted} 
      />
      <Text style={[
        styles.requirementText, 
        { 
          color: isValid ? colors.primary : colors.textMuted,
          textDecorationLine: isValid ? 'line-through' : 'none'
        }
      ]}>
        {text}
      </Text>
    </View>
  );
  const { login } = useAuth();
  
  const handleLogin = async () => {
    try {
      setErrorMessage('');
      setMessageType('info');
      setIsLoading(true);
      
      // Validate inputs
      if (!email || !password) {
        setTimeout(() => {
          setErrorMessage('Please enter both email and password');
          setMessageType('error');
        }, 0);
        return;
      }
      
      try {
        // Call the login API
        await login(email, password);
        
        // Success - JWT will be stored by the authService
        setErrorMessage('Login successful!');
        setMessageType('success');
        setTimeout(() => router.push('/(tabs)'), 1000);
      } catch (error: any) {
        // Handle different error types
        let message = 'An unexpected error occurred';
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          message = error.response.data?.message || 'Invalid credentials';
        } else if (error.request) {
          // The request was made but no response was received
          message = 'Network error. Please check your connection.';
        } else if (error.message) {
          // Something happened in setting up the request that triggered an Error
          message = error.message;
        }
        
        setTimeout(() => {
          setErrorMessage(message);
          setMessageType('error');
        }, 0);
        
        console.error('Error during login:', error);
      }
    } catch (unexpectedError) {
      // Catch any unexpected errors in the login process itself
      console.error('Unexpected login error:', unexpectedError);
      setTimeout(() => {
        setErrorMessage('An unexpected error occurred. Please try again.');
        setMessageType('error');
      }, 0);
    } finally {
      setIsLoading(false);
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <MessageBox message={errorMessage} type={messageType} />
      <KeyboardAvoidingView
        style={[styles.outerContainer, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ModernCard style={styles.card} padding="lg">
            <Text style={[styles.headerText, { color: colors.text }]}>Think it. Make it.</Text>
            <Text style={[styles.subText, { color: colors.textMuted }]}>Log into your PrismaNote account</Text>

            {/* Email */}
            <ModernInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{ marginBottom: Spacing.sm }}
            />

            {/* Password */}
            <ModernInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setShowPasswordRequirements(text.length > 0);
                if (text.length > 0 && !validatePassword(text)) {
                  setErrorMessage('');
                  setMessageType('info');
                } else {
                  setErrorMessage('');
                }
              }}
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              }
              style={{ marginBottom: Spacing.sm }}
            />

            {/* Password Requirements */}
            {showPasswordRequirements && (
              <View style={styles.passwordRequirements}>
                <Text style={[styles.requirementsTitle, { color: colors.text }]}>
                  Password Requirements:
                </Text>
                {renderPasswordRequirement("At least 6 characters", passwordChecks.minLength)}
                {renderPasswordRequirement("One number", passwordChecks.hasNumber)}
                {renderPasswordRequirement("One lowercase letter", passwordChecks.hasLowercase)}
                {renderPasswordRequirement("One uppercase letter", passwordChecks.hasUppercase)}
                {renderPasswordRequirement("One special character (@#$%^&+=!)", passwordChecks.hasSpecialChar)}
              </View>
            )}

            <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <ModernButton
              title="Log in"
              onPress={handleLogin}
              loading={isLoading}
              variant="gradient"
              size="md"
              leftIcon={<Ionicons name="log-in-outline" size={18} color="#fff" />}
              enableHaptics
              style={{ marginBottom: Spacing.sm }}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <ModernButton
                title=""
                onPress={handleGoogleLogin}
                variant="outline"
                size="md"
                leftIcon={<Ionicons name="logo-google" size={28} color="#DB4437" />}
                style={styles.socialButton}
              />
              <ModernButton
                title=""
                onPress={handleAppleLogin}
                variant="outline"
                size="md"
                leftIcon={<Ionicons name="logo-apple" size={28} color={colors.text} />}
                style={styles.socialButton}
              />
              <ModernButton
                title=""
                onPress={handleMicrosoftLogin}
                variant="outline"
                size="md"
                leftIcon={<Ionicons name="logo-microsoft" size={28} color="#0078D4" />}
                style={styles.socialButton}
              />
            </View>

            {/* Signup Option */}
            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: colors.textMuted }]}>Don't have an account? Register for free</Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={[styles.signupLink, { color: colors.primary }]}>Sign up</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.termsText, { color: colors.textMuted }]}>
              By continuing, you acknowledge that you understand and agree to the Terms & condition and Privacy Policy
            </Text>
            <View style={styles.bottomLinksRow}>
              <TouchableOpacity>
                <Text style={[styles.bottomLink, { color: colors.primary }]}>Privacy & terms</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.bottomLink, { color: colors.primary }]}>Need help?</Text>
              </TouchableOpacity>
            </View>
          </ModernCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  outerContainer: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  headerText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold as any,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subText: {
    fontSize: Typography.fontSize.lg,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.base,
    textDecorationLine: 'underline',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.sm,
    fontSize: Typography.fontSize.sm,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  socialButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    minWidth: 60,
    aspectRatio: 1,
  },
  socialIconButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 80,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signupContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  signupText: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.xs,
  },
  signupLink: {
    fontWeight: Typography.fontWeight.semiBold as any,
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.xs,
  },
  termsText: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  bottomLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  bottomLink: {
    fontSize: Typography.fontSize.sm,
    textDecorationLine: 'underline',
    marginHorizontal: Spacing.sm,
  },
  passwordRequirements: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  requirementsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginBottom: Spacing.xs,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  requirementText: {
    fontSize: Typography.fontSize.sm,
    marginLeft: Spacing.xs,
    flex: 1,
  },
});

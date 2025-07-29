import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernInput } from '../../components/ui/ModernInput';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography } from '../../styles/tokens';
import productivityQuotes from '../others/productivityQuotes.json';
// Add these imports for the modals
import { NeedHelpModal } from '../../components/modals/NeedHelp';
import { PrivacyTermsModal } from '../../components/modals/Privacy&Terms';

const { height, width } = Dimensions.get('window');

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
  const [currentQuote, setCurrentQuote] = useState({ text: '', author: '' });
  
  // Add these state variables for the modals
  const [showPrivacyTermsModal, setShowPrivacyTermsModal] = useState(false);
  const [showNeedHelpModal, setShowNeedHelpModal] = useState(false);
  const [initialTab, setInitialTab] = useState<'privacy' | 'terms'>('privacy');

  // Password validation individual checks
  const passwordChecks = {
    minLength: password.length >= 6,
    hasNumber: /[0-9]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasSpecialChar: /[@#$%^&+=!]/.test(password),
  };

  // Get random quote on component mount
  useEffect(() => {
    const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * productivityQuotes.quotes.length);
      setCurrentQuote(productivityQuotes.quotes[randomIndex]);
    };
    getRandomQuote();
  }, []);

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
              style={{ marginBottom: Spacing.lg }}
            />

            {/* Inspirational Quote */}
            <View style={[styles.quoteContainer, { borderLeftColor: colors.primary }] as any}>
              <View style={styles.quoteIconContainer}>
                <Ionicons name="bulb-outline" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.quoteText, { color: colors.text }]}>
                "{currentQuote.text}"
              </Text>
              <Text style={[styles.quoteAuthor, { color: colors.textMuted }]}>
                — {currentQuote.author}
              </Text>
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
            {/* Updated bottom links with modal functionality */}
            <View style={styles.bottomLinksRow}>
              <TouchableOpacity onPress={() => {
                setInitialTab('privacy');
                setShowPrivacyTermsModal(true);
              }}>
                <Text style={[styles.bottomLink, { color: colors.primary }]}>Privacy & terms</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowNeedHelpModal(true)}>
                <Text style={[styles.bottomLink, { color: colors.primary }]}>Need help?</Text>
              </TouchableOpacity>
            </View>
          </ModernCard>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add the modals */}
      <PrivacyTermsModal 
        visible={showPrivacyTermsModal} 
        onClose={() => setShowPrivacyTermsModal(false)}
        initialTab={initialTab}
      />

      <NeedHelpModal 
        visible={showNeedHelpModal} 
        onClose={() => setShowNeedHelpModal(false)} 
      />
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
  quoteContainer: {
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderRadius: 16,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: '#64ffda',
    alignItems: 'center',
  },
  quoteIconContainer: {
    marginBottom: Spacing.sm,
  },
  quoteText: {
    fontSize: Typography.fontSize.base,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  quoteAuthor: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    textAlign: 'center',
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
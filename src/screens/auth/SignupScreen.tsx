import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernInput } from '../../components/ui/ModernInput';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography } from '../../styles/tokens';

const { height, width } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const validatePassword = (text: string) => {
    const checks = {
      minLength: text.length >= 6,
      hasNumber: /[0-9]/.test(text),
      hasLowercase: /[a-z]/.test(text),
      hasUppercase: /[A-Z]/.test(text),
      hasSpecialChar: /[@#$%^&+=!]/.test(text),
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
  const { register } = useAuth();
  
  const handleSignup = async () => {
    try {
      setErrorMessage('');
      setMessageType('info');
      setIsLoading(true);
      
      // Validate inputs
      if (!fullName || !email || !password) {
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
        
        // Success
        setErrorMessage('Signup successful! Please check your email for verification code.');
        setMessageType('success');
        
        // Redirect to OTP verification screen after a delay
        setTimeout(() => router.push({
          pathname: '/otp-verification',
          params: { email }
        }), 1500);
      } catch (error: any) {
        // Handle different error types
        let message = 'An unexpected error occurred';
        
        if (error.response) {
          message = error.response.data?.message || 'Registration failed';
        } else if (error.request) {
          message = 'Network error. Please check your connection.';
        } else if (error.message) {
          message = error.message;
        }
        
        setTimeout(() => {
          setErrorMessage(message);
          setMessageType('error');
        }, 0);
        
        console.error('Error during signup:', error);
      }
    } catch (unexpectedError) {
      console.error('Unexpected signup error:', unexpectedError);
      setTimeout(() => {
        setErrorMessage('An unexpected error occurred. Please try again.');
        setMessageType('error');
      }, 0);
    } finally {
      setIsLoading(false);
    }
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
            <View style={styles.imageContainer}>
              <Image
                source={require('../../../assets/images/notion-desk.png')}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            
            <Text style={[styles.headerText, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subText, { color: colors.textMuted }]}>Join PrismaNote and start organizing your ideas</Text>

            {/* Full Name */}
            <ModernInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              style={{ marginBottom: Spacing.sm }}
            />

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
              onChangeText={(text: string) => {
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

            {/* Sign Up Button */}
            <ModernButton
              title="Sign Up"
              onPress={handleSignup}
              loading={isLoading}
              variant="gradient"
              size="md"
              leftIcon={<Ionicons name="person-add-outline" size={18} color="#fff" />}
              enableHaptics
              style={{ marginBottom: Spacing.sm }}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Login Option */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textMuted }]}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Log in</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.termsText, { color: colors.textMuted }]}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  image: {
    width: 120,
    height: 100,
    marginBottom: Spacing.sm,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.sm,
    fontSize: Typography.fontSize.sm,
  },
  loginContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  loginText: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.xs,
  },
  loginLink: {
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

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
  View
} from 'react-native';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernCard } from '../../components/ui/ModernCard';
import { useTheme } from '../../context/ThemeContext';
import * as authService from '../../services/authService';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';

const { width, height } = Dimensions.get('window');

export default function OtpVerificationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));

  // set up refs for OTP input fields
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // countdown timer for resend button
  useEffect(() => {
    if (resendDisabled && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
  }, [resendDisabled, countdown]);

  const handleOtpChange = (text: string, index: number) => {
    // only allow single digit numbers
    if (text.match(/^[0-9]$/) || text === '') {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // auto focus to next field if text is entered
      if (text !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // move to previous field on backspace when field is empty
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setErrorMessage('Please enter a complete 6-digit OTP code');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    try {
      // Verify OTP through auth service
      await authService.verifyOtp(email as string, otpValue);
      
      // Show success message
      setErrorMessage('OTP verified successfully!');
      setMessageType('success');
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      // Handle different error types
      if (error.response) {
        const message = error.response.data.message || 'Invalid OTP';
        setErrorMessage(message);
      } else if (error.request) {
        setErrorMessage('Network error. Please check your connection.');
      } else {
        setErrorMessage('An unexpected error occurred');
      }
      setMessageType('error');
      console.error('Error during OTP verification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;
    
    try {
      setIsLoading(true);
        // Call resend OTP endpoint
      await authService.resendOtp(email as string);
      
      setErrorMessage('A new verification code has been sent to your email.');
      setMessageType('success');
      
      // Disable resend button and start countdown
      setResendDisabled(true);
      setCountdown(30);
    } catch (error: any) {
      if (error.response) {
        const message = error.response.data.message || 'Failed to resend OTP';
        setErrorMessage(message);
      } else if (error.request) {
        setErrorMessage('Network error. Please check your connection.');
      } else {
        setErrorMessage('An unexpected error occurred');
      }
      setMessageType('error');
      console.error('Error resending OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <MessageBox message={errorMessage} type={messageType} />
      <KeyboardAvoidingView
        style={[styles.outerContainer, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoTopContainer}>
            <Image
              source={require('../../../assets/images/notion-desk.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          
          <ModernCard style={styles.card} padding="lg">
            <Text style={[styles.headerText, { color: colors.text }]}>OTP Verification</Text>
            <Text style={[styles.subText, { color: colors.textMuted }]}>
              Please enter the 6-digit code sent to your email
            </Text>
            
            <View style={styles.otpContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    { 
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      color: colors.text 
                    }
                  ]}
                  value={otp[index]}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>
            
            <ModernButton
              title="Verify OTP"
              onPress={handleVerifyOtp}
              loading={isLoading}
              variant="gradient"
              size="md"
              leftIcon={<Ionicons name="checkmark-circle-outline" size={18} color="#fff" />}
              enableHaptics
              style={{ marginBottom: Spacing.sm }}
            />
            
            <View style={styles.resendContainer}>
              <Text style={[styles.resendText, { color: colors.textMuted }]}>Didn't receive the code? </Text>
              <TouchableOpacity 
                onPress={handleResendOtp}
                disabled={resendDisabled || isLoading}
              >
                <Text style={[
                  styles.resendButtonText,
                  { color: colors.primary },
                  resendDisabled && { opacity: 0.5 }
                ]}>
                  {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <ModernButton
              title="Back to Signup"
              onPress={() => router.push('/signup')}
              variant="outline"
              size="md"
              leftIcon={<Ionicons name="arrow-back" size={18} color={colors.text} />}
              enableHaptics
              style={{ marginTop: Spacing.sm }}
            />
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
  logoTopContainer: {
    alignItems: 'center',
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
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
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.lg,
  },
  otpInput: {
    width: width / 9,
    height: 56,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold as any,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  resendText: {
    fontSize: Typography.fontSize.sm,
  },
  resendButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold as any,
    textDecorationLine: 'underline',
  },
});

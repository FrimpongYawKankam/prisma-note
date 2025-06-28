import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MessageBox from '../../components/ui/MessageBox';
import * as authService from '../../services/authService';

const { width } = Dimensions.get('window');

export default function OtpVerificationScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('info');
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
    // Move to previous field on backspace when field is empty
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <MessageBox message={errorMessage} type={messageType} />
      
      <Image
        source={require('../../../assets/images/notion-desk.png')}
        style={styles.image}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>
        Please enter the 6-digit code sent to your email
      </Text>
      
      <View style={styles.otpContainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={styles.otpInput}
            value={otp[index]}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleVerifyOtp}
        disabled={isLoading}
      >
        <View style={styles.buttonContent}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Verify OTP</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the code? </Text>
        <TouchableOpacity 
          onPress={handleResendOtp}
          disabled={resendDisabled || isLoading}
        >
          <Text style={[
            styles.resendButtonText,
            resendDisabled && { opacity: 0.5 }
          ]}>
            {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.buttonContent}>
          <Ionicons name="arrow-back" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Back to Signup</Text>
        </View>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    width: width / 8,
    height: 50,
    borderWidth: 1,
    borderColor: '#1E90FF',
    borderRadius: 8,
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#1a1a1a',
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
  backButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
  resendContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#aaa',
    fontSize: 14,
  },
  resendButtonText: {
    color: '#1E90FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

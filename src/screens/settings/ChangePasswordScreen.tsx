import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernDialog } from '../../components/ui/ModernDialog';
import { useTheme } from '../../context/ThemeContext';
import { changePasswordForLoggedInUser } from '../../services/authService';

export default function ChangePasswordScreen() {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    isSuccess: false
  });

  // Animation refs for each input
  const currentPasswordAnimation = useRef(new Animated.Value(0)).current;
  const newPasswordAnimation = useRef(new Animated.Value(0)).current;
  const confirmPasswordAnimation = useRef(new Animated.Value(0)).current;

  const showDialog = (title: string, message: string, isSuccess: boolean = false) => {
    setDialogConfig({ title, message, isSuccess });
    setDialogVisible(true);
  };

  // Animation functions
  const animateInput = (animation: Animated.Value, toValue: number) => {
    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputFocus = (animation: Animated.Value) => {
    animateInput(animation, 1);
  };

  const handleInputBlur = (animation: Animated.Value) => {
    animateInput(animation, 0);
  };

  // Password validation function
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return minLength && hasUpper && hasLower && hasNumber && hasSymbol;
  };

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      currentPassword.length > 0 &&
      validatePassword(newPassword) &&
      newPassword === confirmPassword &&
      newPassword !== currentPassword
    );
  }, [currentPassword, newPassword, confirmPassword]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showDialog('Error', 'Please fill in all fields.');
      return;
    }
    if (!validatePassword(newPassword)) {
      showDialog('Error', 'Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showDialog('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      showDialog('Error', 'New password must be different from current password.');
      return;
    }

    setIsLoading(true);
    try {
      // Only send the new password to the backend, current password is for frontend security only
      await changePasswordForLoggedInUser(newPassword);
      showDialog('Success', 'Password changed successfully!', true);
      // Clear form on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password change error:', error);
      showDialog('Error', error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogVisible(false);
    if (dialogConfig.isSuccess) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
      <View style={styles.form}>
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.securityNote, { color: isDark ? colors.primary : '#666' }]}>
          Enter your current password to verify your identity before setting a new password.
        </Text>
        {/* Current Password Input */}
        <Animated.View style={[
          styles.inputContainer,
          {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: currentPasswordAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
            shadowRadius: currentPasswordAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
            elevation: currentPasswordAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
          }
        ]}>
          <Animated.View style={[
            styles.inputWrapper,
            {
              borderColor: currentPasswordAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [isDark ? '#333' : '#ccc', colors.primary],
              }),
              borderWidth: currentPasswordAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2],
              }),
            }
          ]}>
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
              placeholder="Current Password"
              placeholderTextColor={isDark ? '#aaa' : '#888'}
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              onFocus={() => handleInputFocus(currentPasswordAnimation)}
              onBlur={() => handleInputBlur(currentPasswordAnimation)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons
                name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* New Password Input */}
        <Animated.View style={[
          styles.inputContainer,
          {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: newPasswordAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
            shadowRadius: newPasswordAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
            elevation: newPasswordAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
          }
        ]}>
          <Animated.View style={[
            styles.inputWrapper,
            {
              borderColor: newPasswordAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [isDark ? '#333' : '#ccc', colors.primary],
              }),
              borderWidth: newPasswordAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2],
              }),
            }
          ]}>
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
              placeholder="New Password"
              placeholderTextColor={isDark ? '#aaa' : '#888'}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              onFocus={() => handleInputFocus(newPasswordAnimation)}
              onBlur={() => handleInputBlur(newPasswordAnimation)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Password Requirements */}
        {newPassword.length > 0 && (
          <View style={styles.requirementsContainer}>
            <Text style={[styles.requirementsTitle, { color: isDark ? '#fff' : '#000' }]}>
              Password Requirements:
            </Text>
            <Text style={[
              styles.requirement,
              { color: newPassword.length >= 8 ? colors.primary : (isDark ? '#aaa' : '#888') }
            ]}>
              • At least 8 characters
            </Text>
            <Text style={[
              styles.requirement,
              { color: /[A-Z]/.test(newPassword) ? colors.primary : (isDark ? '#aaa' : '#888') }
            ]}>
              • One uppercase letter
            </Text>
            <Text style={[
              styles.requirement,
              { color: /[a-z]/.test(newPassword) ? colors.primary : (isDark ? '#aaa' : '#888') }
            ]}>
              • One lowercase letter
            </Text>
            <Text style={[
              styles.requirement,
              { color: /\d/.test(newPassword) ? colors.primary : (isDark ? '#aaa' : '#888') }
            ]}>
              • One number
            </Text>
            <Text style={[
              styles.requirement,
              { color: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? colors.primary : (isDark ? '#aaa' : '#888') }
            ]}>
              • One special character
            </Text>
          </View>
        )}

        {/* Confirm Password Input */}
        <Animated.View style={[
          styles.inputContainer,
          {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: confirmPasswordAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
            shadowRadius: confirmPasswordAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
            elevation: confirmPasswordAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
          }
        ]}>
          <Animated.View style={[
            styles.inputWrapper,
            {
              borderColor: confirmPasswordAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [isDark ? '#333' : '#ccc', colors.primary],
              }),
              borderWidth: confirmPasswordAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2],
              }),
            }
          ]}>
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
              placeholder="Confirm New Password"
              placeholderTextColor={isDark ? '#aaa' : '#888'}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => handleInputFocus(confirmPasswordAnimation)}
              onBlur={() => handleInputBlur(confirmPasswordAnimation)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Password Match Indicator */}
        {confirmPassword.length > 0 && newPassword.length > 0 && (
          <Text style={[
            styles.matchIndicator,
            { color: newPassword === confirmPassword ? colors.primary : (isDark ? '#ff6b6b' : '#e74c3c') }
          ]}>
            {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.changeBtn,
            {
              backgroundColor: isFormValid && !isLoading ? colors.primary : (isDark ? '#333' : '#ccc'),
              opacity: isFormValid && !isLoading ? 1 : 0.6
            }
          ]}
          onPress={handleChangePassword}
          disabled={!isFormValid || isLoading}
        >
          <Text style={[
            styles.changeBtnText,
            { color: isFormValid && !isLoading ? 'white' : (isDark ? '#666' : '#999') }
          ]}>
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Text>
        </TouchableOpacity>

        {/* Password Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={[styles.tipsTitle, { color: isDark ? colors.primary : '#000' }]}>
            Tips for a strong password
          </Text>
          <Text style={[styles.tip, { color: isDark ? '#aaa' : '#666' }]}>
            • Use a unique password that you don't use elsewhere
          </Text>
          <Text style={[styles.tip, { color: isDark ? '#aaa' : '#666' }]}>
            • Make it at least 12 characters long for better security
          </Text>
          <Text style={[styles.tip, { color: isDark ? '#aaa' : '#666' }]}>
            • Include a mix of uppercase, lowercase, numbers, and symbols
          </Text>
          <Text style={[styles.tip, { color: isDark ? '#aaa' : '#666' }]}>
            • Avoid using personal information like names or birthdays
          </Text>
          <Text style={[styles.tip, { color: isDark ? '#aaa' : '#666' }]}>
            • Consider using a passphrase with random words
          </Text>
        </View>
      </View>
      {/* Dialog for error/success messages */}
      <ModernDialog
        visible={dialogVisible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        buttons={[
          {
            text: 'OK',
            onPress: handleDialogClose,
            style: dialogConfig.isSuccess ? 'default' : 'default'
          }
        ]}
        onClose={handleDialogClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '500',
    lineHeight: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    lineHeight: 30,
  },
  securityNote: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  input: {
    padding: 15,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  requirementsContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    marginBottom: 4,
  },
  matchIndicator: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  changeBtn: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  changeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  tip: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
});

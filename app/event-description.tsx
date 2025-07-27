import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../src/styles/tokens';

export default function EventDescriptionScreen() {
  const { description: initialDescription } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  const [description, setDescription] = useState((initialDescription as string) || '');

  const handleSave = () => {
    // Navigate back with the description as a parameter
    router.replace({
      pathname: '/set-event',
      params: { updatedDescription: description }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancelButton, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Event Description
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveButton, { color: colors.primary }]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                color={colors.textSecondary} 
              />
              <Text style={[styles.label, { color: colors.text }]}>
                Notes
              </Text>
            </View>
            
            <TextInput
              placeholder="Add description for your event..."
              value={description}
              onChangeText={setDescription}
              multiline
              autoFocus
              style={[styles.textInput, { 
                color: colors.text,
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }]}
              placeholderTextColor={colors.textTertiary}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: colors.textTertiary }]}>
              Add any additional details, reminders, or notes for this event.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal as any,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold as any,
    minWidth: 60,
    textAlign: 'right',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  inputContainer: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    minHeight: 200,
  },
  infoContainer: {
    paddingVertical: Spacing.lg,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.sm,
  },
});

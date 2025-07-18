import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../src/context/ThemeContext';

export default function EventDescriptionScreen() {
  const { description: initialDescription } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [description, setDescription] = useState((initialDescription as string) || '');

  const handleSave = () => {
    // Navigate back with the description as a parameter
    router.replace({
      pathname: '/set-event',
      params: { updatedDescription: description }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancelButton, { color: isDark ? '#ccc' : '#666' }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
          Event Description
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveButton, { color: '#007bff' }]}>
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
                color={isDark ? '#ccc' : '#666'} 
              />
              <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>
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
                color: isDark ? '#fff' : '#000',
                backgroundColor: isDark ? '#111' : '#f9f9f9',
                borderColor: isDark ? '#333' : '#ddd',
              }]}
              placeholderTextColor={isDark ? '#666' : '#999'}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: isDark ? '#666' : '#999' }]}>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 16,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
  },
  infoContainer: {
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

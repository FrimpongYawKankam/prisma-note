import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../styles/tokens';
import { ModernButton } from '../ui/ModernButton';
import { ModernInput } from '../ui/ModernInput';
import { CreateNoteRequest, UpdateNoteRequest, Note } from '../../types/api';
import { validateNoteData } from '../../services/noteService';

interface NoteFormProps {
  initialNote?: Note;
  onSubmit: (noteData: CreateNoteRequest | UpdateNoteRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export const NoteForm: React.FC<NoteFormProps> = ({
  initialNote,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content || '');
    }
  }, [initialNote]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: Spacing.base,
    },
    section: {
      marginBottom: Spacing.lg,
    },
    label: {
      fontSize: Typography.fontSize.base,
      fontWeight: '500' as const,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    contentInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.base,
      fontSize: Typography.fontSize.base,
      color: colors.text,
      textAlignVertical: 'top',
      minHeight: 200,
      maxHeight: 400,
    },
    contentInputFocused: {
      borderColor: colors.primary,
    },
    characterCount: {
      fontSize: Typography.fontSize.sm,
      color: colors.textMuted,
      textAlign: 'right',
      marginTop: Spacing.xs,
    },
    errorContainer: {
      marginTop: Spacing.sm,
    },
    errorText: {
      fontSize: Typography.fontSize.sm,
      color: colors.error,
      marginBottom: Spacing.xs,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: Spacing.base,
      marginTop: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    button: {
      flex: 1,
    },
  });

  const validateForm = (): boolean => {
    const noteData = mode === 'create' 
      ? { title: title.trim(), content: content.trim() }
      : { title: title.trim(), content: content.trim() };
    
    const validationErrors = validateNoteData(noteData);
    setErrors(validationErrors);
    
    return validationErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
      };

      await onSubmit(noteData);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to save note. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const titleCharacterCount = title.length;
  const contentCharacterCount = content.length;
  const maxTitleLength = 255;
  const maxContentLength = 10000;

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <ModernInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter note title..."
          />
          <Text style={styles.characterCount}>
            {titleCharacterCount}/{maxTitleLength}
          </Text>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={[
              styles.contentInput,
              // Add focus styling if needed
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="Write your note content here..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={maxContentLength}
            editable={!isLoading}
            textBreakStrategy="simple"
          />
          <Text style={styles.characterCount}>
            {contentCharacterCount}/{maxContentLength}
          </Text>
        </View>

        {/* Error Messages */}
        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {onCancel && (
            <ModernButton
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.button}
              disabled={isLoading}
            />
          )}
          <ModernButton
            title={mode === 'create' ? 'Create Note' : 'Update Note'}
            onPress={handleSubmit}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading || !title.trim()}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default NoteForm;

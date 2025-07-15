import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';

interface DialogButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ModernDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: DialogButton[];
  onClose: () => void;
}

export const ModernDialog: React.FC<ModernDialogProps> = ({
  visible,
  title,
  message,
  buttons,
  onClose,
}) => {
  const { colors } = useTheme();

  const getButtonStyle = (buttonStyle: 'default' | 'cancel' | 'destructive' = 'default'): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.base,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: Spacing.xs,
    };

    switch (buttonStyle) {
      case 'destructive':
        return {
          ...baseStyle,
          backgroundColor: colors.error,
        };
      case 'cancel':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
    }
  };

  const getButtonTextStyle = (buttonStyle: 'default' | 'cancel' | 'destructive' = 'default'): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: Typography.fontSize.base,
      fontWeight: '600',
    };

    switch (buttonStyle) {
      case 'destructive':
        return {
          ...baseStyle,
          color: '#fff',
        };
      case 'cancel':
        return {
          ...baseStyle,
          color: colors.text,
        };
      default:
        return {
          ...baseStyle,
          color: '#fff',
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>
            {message}
          </Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={getButtonStyle(button.style)}
                onPress={button.onPress}
                activeOpacity={0.7}
              >
                <Text style={getButtonTextStyle(button.style)}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialog: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSize.base,
    lineHeight: 20,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
});

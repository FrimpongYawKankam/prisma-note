// 📅 Modern Date Picker Component
// Reusable date picker with clean design

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { ModernButton } from './ModernButton';
import { ModernCard } from './ModernCard';

interface DatePickerProps {
  value: Date;
  onDateChange: (date: Date) => void;
  label?: string;
  labelColor?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  disabled?: boolean;
}

export const ModernDatePicker: React.FC<DatePickerProps> = ({
  value,
  onDateChange,
  label,
  labelColor,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  mode = 'date',
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    if (mode === 'date') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (mode === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  const openPicker = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: labelColor || colors.text }]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={openPicker}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.dateContent}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.icon}
          />
          <Text
            style={[
              styles.dateText,
              {
                color: value ? colors.text : colors.textSecondary,
              },
            ]}
          >
            {value ? formatDate(value) : placeholder}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* iOS Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={closePicker}
        >
          <View style={styles.modalOverlay}>
            <ModernCard variant="elevated" style={styles.pickerCard}>
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: colors.text }]}>
                  Select {mode === 'date' ? 'Date' : mode === 'time' ? 'Time' : 'Date & Time'}
                </Text>
              </View>
              
              <DateTimePicker
                value={value}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor={colors.text}
                style={styles.picker}
              />
              
              <View style={styles.pickerActions}>
                <ModernButton
                  title="Cancel"
                  onPress={closePicker}
                  variant="secondary"
                  style={styles.actionButton}
                />
                <ModernButton
                  title="Done"
                  onPress={closePicker}
                  variant="primary"
                  style={styles.actionButton}
                />
              </View>
            </ModernCard>
          </View>
        </Modal>
      )}

      {/* Android Picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  dateText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    margin: Spacing.base,
    marginBottom: Spacing.xl,
  },
  pickerHeader: {
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: Spacing.lg,
  },
  pickerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    textAlign: 'center',
  },
  picker: {
    height: 200,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});

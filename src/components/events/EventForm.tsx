import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getTagColor, validateEventData } from '../../services/eventService';
import { Spacing, Typography } from '../../styles/tokens';
import { CreateEventRequest, Event, EventTag, UpdateEventRequest } from '../../types/api';
import { ModernButton } from '../ui/ModernButton';
import { ModernDialog } from '../ui/ModernDialog';
import { ModernInput } from '../ui/ModernInput';

interface EventFormProps {
  mode: 'create' | 'edit';
  initialEvent?: Event;
  onSubmit: (eventData: CreateEventRequest | UpdateEventRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  mode,
  initialEvent,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [tag, setTag] = useState<EventTag>(EventTag.NONE);
  const [errors, setErrors] = useState<string[]>([]);
  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Date/time picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description || '');
      setAllDay(initialEvent.allDay);
      setStartDate(initialEvent.startDateTime);
      setEndDate(initialEvent.endDateTime);
      setStartTime(initialEvent.startDateTime);
      setEndTime(initialEvent.endDateTime);
      setTag(initialEvent.tag);
    }
  }, [initialEvent]);

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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dateTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 20,
    },
    dateTimeRow: {
      flex: 1,
      alignItems: 'center',
    },
    dateTimeText: {
      fontSize: Typography.fontSize.base,
      fontWeight: '500' as const,
      color: colors.text,
    },
    tagContainer: {
      flexDirection: 'row',
      gap: 10,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexWrap: 'wrap',
    },
    tagButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    tagButtonText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '500' as const,
    },
    descriptionInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.base,
      fontSize: Typography.fontSize.base,
      color: colors.text,
      textAlignVertical: 'top',
      minHeight: 120,
      maxHeight: 200,
    },
    errorContainer: {
      backgroundColor: colors.error + '20',
      borderRadius: 8,
      padding: Spacing.sm,
      marginBottom: Spacing.md,
    },
    errorText: {
      color: colors.error,
      fontSize: Typography.fontSize.sm,
      marginBottom: 4,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: Spacing.base,
      marginTop: Spacing.lg,
    },
    button: {
      flex: 1,
    },
  });

  const createDateTime = (date: Date, time: Date) => {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSubmit = async () => {
    try {
      setErrors([]);

      const startDateTime = allDay ? startDate : createDateTime(startDate, startTime);
      const endDateTime = allDay ? endDate : createDateTime(endDate, endTime);

      const eventData = {
        title: title.trim(),
        description: description.trim() || undefined,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        tag,
        allDay,
      };

      // Validate event data
      const validationErrors = validateEventData(eventData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Additional validation for date/time
      if (endDateTime <= startDateTime) {
        setErrors(['End time must be after start time']);
        return;
      }

      await onSubmit(eventData);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to save event. Please try again.');
      setErrorDialog(true);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const maxTitleLength = 255;
  const maxDescriptionLength = 1000;
  const titleCharacterCount = title.length;
  const descriptionCharacterCount = description.length;

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
            onChangeText={(text) => {
              if (text.length <= maxTitleLength) {
                setTitle(text);
              }
            }}
            placeholder="Enter event title..."
            disabled={isLoading}
          />
          <Text style={{ fontSize: Typography.fontSize.sm, color: colors.textMuted, marginTop: 4 }}>
            {titleCharacterCount}/{maxTitleLength}
          </Text>
        </View>

        {/* All Day Toggle */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>All day</Text>
            <Switch
              value={allDay}
              onValueChange={setAllDay}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
              disabled={isLoading}
            />
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeRow}
              onPress={() => setShowStartDatePicker(true)}
              disabled={isLoading}
            >
              <Text style={styles.dateTimeText}>
                {formatDate(startDate)}
              </Text>
            </TouchableOpacity>
            
            <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
            
            <TouchableOpacity
              style={styles.dateTimeRow}
              onPress={() => setShowEndDatePicker(true)}
              disabled={isLoading}
            >
              <Text style={styles.dateTimeText}>
                {formatDate(endDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Selection (if not all day) */}
        {!allDay && (
          <View style={styles.section}>
            <Text style={styles.label}>Time</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeRow}
                onPress={() => setShowStartTimePicker(true)}
                disabled={isLoading}
              >
                <Text style={styles.dateTimeText}>
                  {formatTime(startTime)}
                </Text>
              </TouchableOpacity>

              <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />

              <TouchableOpacity
                style={styles.dateTimeRow}
                onPress={() => setShowEndTimePicker(true)}
                disabled={isLoading}
              >
                <Text style={styles.dateTimeText}>
                  {formatTime(endTime)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Priority/Tag Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.tagContainer}>
            {([EventTag.NONE, EventTag.LOW, EventTag.MEDIUM, EventTag.HIGH]).map((tagOption) => (
              <TouchableOpacity
                key={tagOption}
                style={[
                  styles.tagButton,
                  { 
                    backgroundColor: tag === tagOption ? getTagColor(tagOption) : 'transparent',
                    borderColor: getTagColor(tagOption),
                  }
                ]}
                onPress={() => setTag(tagOption)}
                disabled={isLoading}
              >
                <Text style={[
                  styles.tagButtonText,
                  { color: tag === tagOption ? '#fff' : getTagColor(tagOption) }
                ]}>
                  {tagOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add event description..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={maxDescriptionLength}
            editable={!isLoading}
            textBreakStrategy="simple"
          />
          <Text style={{ fontSize: Typography.fontSize.sm, color: colors.textMuted, marginTop: 4 }}>
            {descriptionCharacterCount}/{maxDescriptionLength}
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
            title={mode === 'create' ? 'Create Event' : 'Update Event'}
            onPress={handleSubmit}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading || !title.trim()}
          />
        </View>
      </ScrollView>

      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowStartDatePicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowEndDatePicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
            setShowStartTimePicker(false);
            if (selectedTime) setStartTime(selectedTime);
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
            setShowEndTimePicker(false);
            if (selectedTime) setEndTime(selectedTime);
          }}
        />
      )}
      
      {/* Error Dialog */}
      <ModernDialog
        visible={errorDialog}
        title="Error"
        message={errorMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => setErrorDialog(false),
          },
        ]}
        onClose={() => setErrorDialog(false)}
      />
    </View>
  );
};

export default EventForm;

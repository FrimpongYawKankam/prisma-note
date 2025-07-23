import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ModernButton } from '../src/components/ui/ModernButton';
import { ModernDialog } from '../src/components/ui/ModernDialog';
import { useAuth } from '../src/context/AuthContext';
import { useEvents } from '../src/context/EventsContext';
import { useTheme } from '../src/context/ThemeContext';
import { EventTag } from '../src/types/api';

export default function SetEventScreen() {
  const { date, updatedDescription } = useLocalSearchParams();
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const { createEvent } = useEvents();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState((updatedDescription as string) || '');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date(date as string || new Date()));
  const [endDate, setEndDate] = useState(new Date(date as string || new Date()));
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later

  // Handle all-day toggle with automatic end date calculation
  const handleAllDayToggle = (value: boolean) => {
    setAllDay(value);
    
    // If setting to all day, automatically set end date to next day at midnight
    if (value) {
      const nextDay = new Date(startDate);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0); // Set to midnight
      
      setEndDate(nextDay);
    }
  };
  const [tag, setTag] = useState<EventTag>(EventTag.NONE);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  // Update description when returning from description screen
  useEffect(() => {
    if (updatedDescription) {
      setDescription(updatedDescription as string);
    }
  }, [updatedDescription]);

  const showDialog = (title: string, message: string, buttons: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>) => {
    setDialogConfig({ title, message, buttons });
    setDialogVisible(true);
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

  const getTagColor = (tagType: EventTag) => {
    switch (tagType) {
      case 'HIGH': return '#ff4757';
      case 'MEDIUM': return '#ffa502';
      case 'LOW': return '#2ed573';
      default: return '#70a1ff';
    }
  };

  const createDateTime = (date: Date, time: Date) => {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined;
  };

  const handleDescriptionPress = () => {
    router.push({
      pathname: '/event-description',
      params: { description }
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showDialog('Error', 'Please enter a title for the event', [
        { text: 'OK', onPress: () => setDialogVisible(false) }
      ]);
      return;
    }

    if (!user?.id) {
      showDialog('Error', 'User not found. Please login again.', [
        { text: 'OK', onPress: () => setDialogVisible(false) }
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const startDateTime = allDay ? startDate : createDateTime(startDate, startTime);
      const endDateTime = allDay ? endDate : createDateTime(endDate, endTime);

      if (endDateTime <= startDateTime) {
        showDialog('Error', 'End time must be after start time', [
          { text: 'OK', onPress: () => setDialogVisible(false) }
        ]);
        setIsLoading(false);
        return;
      }

      const eventData = {
        title: title.trim(),
        description: description.trim() || undefined,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        tag,
        allDay,
      };

      await createEvent(eventData);
      
      showDialog('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => { setDialogVisible(false); router.back(); } }
      ]);
    } catch (error) {
      console.error('Error creating event:', error);
      showDialog('Error', 'Failed to create event. Please try again.', [
        { text: 'OK', onPress: () => setDialogVisible(false) }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
        {/* Title */}
        <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
          <TextInput
            placeholder="Event Title"
            value={title}
            onChangeText={setTitle}
            style={[styles.titleInput, { 
              color: isDark ? '#fff' : '#000',
            }]}
            placeholderTextColor={isDark ? '#aaa' : '#888'}
          />
        </View>

        {/* All Day Toggle */}
        <View style={[styles.section]}>
          <View style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>All day</Text>
            <Switch
              value={allDay}
              onValueChange={handleAllDayToggle}
              trackColor={{ false: isDark ? '#666' : '#ccc', true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          {allDay && (
            <Text style={[styles.helperText, { color: isDark ? '#666' : '#999', marginTop: 8, marginLeft: 16 }]}>
              ℹ️ End date automatically set to next day at 12:00 AM
            </Text>
          )}
        </View>

        {/* Start Date and Time */}
        <View style={[styles.section]}>
          <TouchableOpacity
            style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.dateTimeContent}>
              <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Start</Text>
              <Text style={[styles.dateTimeText, { color: colors.primary }]}>
                {formatDate(startDate)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* End Date - Hidden for all-day events */}
        {!allDay && (
          <View style={[styles.section]}>
            <TouchableOpacity
              style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.dateTimeContent}>
                <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>End</Text>
                <Text style={[styles.dateTimeText, { color: colors.primary }]}>
                  {formatDate(endDate)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.arrow} />
            </TouchableOpacity>
          </View>
        )}

        {!allDay && (
          <>
            <View style={[styles.section]}>
              <TouchableOpacity
                style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
                onPress={() => setShowStartTimePicker(true)}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.dateTimeContent}>
                  <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Start Time</Text>
                  <Text style={[styles.dateTimeText, { color: colors.primary }]}>
                    {formatTime(startTime)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.arrow} />
              </TouchableOpacity>
            </View>

            <View style={[styles.section]}>
              <TouchableOpacity
                style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.dateTimeContent}>
                  <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>End Time</Text>
                  <Text style={[styles.dateTimeText, { color: colors.primary }]}>
                    {formatTime(endTime)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.arrow} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Priority/Tag Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Priority
          </Text>
          <View style={[styles.tagContainer]}>
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

        {/* Description */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]} 
            onPress={handleDescriptionPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.descriptionContainer}>
              <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Notes</Text>
              {description ? (
                <Text style={[styles.descriptionPreview, { color: isDark ? '#ccc' : '#666' }]} numberOfLines={2}>
                  {description}
                </Text>
              ) : (
                <Text style={[styles.descriptionPlaceholder, { color: isDark ? '#666' : '#999' }]}>
                  Add description...
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomContainer}>
          <ModernButton
            title="Cancel"
            onPress={() => router.back()}
            style={styles.cancelButtonBottom}
          />
          <ModernButton
            title="Save Event"
            onPress={handleSave}
            disabled={isLoading}
            style={styles.saveButton}
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
            if (selectedDate) {
              setStartDate(selectedDate);
              
              // If it's an all-day event, automatically update end date to next day at midnight
              if (allDay) {
                const nextDay = new Date(selectedDate);
                nextDay.setDate(nextDay.getDate() + 1);
                nextDay.setHours(0, 0, 0, 0);
                setEndDate(nextDay);
              }
            }
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
      
      {/* Dialog for confirmations and messages */}
      <ModernDialog
        visible={dialogVisible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        buttons={dialogConfig.buttons}
        onClose={() => setDialogVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    lineHeight: 30,
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
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '500',
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  dateTimeContent: {
    flex: 1,
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  arrow: {
    marginLeft: 'auto',
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    paddingVertical: 10,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionContainer: {
    flex: 1,
  },
  descriptionPreview: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  descriptionPlaceholder: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  bottomContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
    marginBottom: 20,
  },
  cancelButtonBottom: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
  },
});

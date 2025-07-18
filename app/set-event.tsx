import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ModernButton } from '../src/components/ui/ModernButton';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import axiosInstance from '../src/utils/axiosInstance';

type TagType = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export default function SetEventScreen() {
  const { date, updatedDescription } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState((updatedDescription as string) || '');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date(date as string || new Date()));
  const [endDate, setEndDate] = useState(new Date(date as string || new Date()));
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [tag, setTag] = useState<TagType>('NONE');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update description when returning from description screen
  useEffect(() => {
    if (updatedDescription) {
      setDescription(updatedDescription as string);
    }
  }, [updatedDescription]);

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

  const getTagColor = (tagType: TagType) => {
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
      Alert.alert('Error', 'Please enter a title for the event');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setIsLoading(true);

    try {
      const startDateTime = allDay ? startDate : createDateTime(startDate, startTime);
      const endDateTime = allDay ? endDate : createDateTime(endDate, endTime);

      if (endDateTime <= startDateTime) {
        Alert.alert('Error', 'End time must be after start time');
        setIsLoading(false);
        return;
      }

      const eventData = {
        title: title.trim(),
        description: description.trim() || null,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        userId: user.id,
        tag,
        allDay,
      };

      await axiosInstance.post('/api/events', eventData);
      
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.cancelButton, { color: isDark ? '#ccc' : '#666' }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <TouchableOpacity>
              <Ionicons name="happy-outline" size={24} color={isDark ? '#ccc' : '#666'} />
            </TouchableOpacity>
            <View style={[styles.tagIndicator, { backgroundColor: getTagColor(tag) }]} />
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Title */}
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={[styles.titleInput, { 
            color: isDark ? '#fff' : '#000',
            backgroundColor: 'transparent',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#333' : '#ddd',
            borderRadius: 0,
          }]}
          placeholderTextColor={isDark ? '#666' : '#999'}
        />

        {/* All Day Toggle */}
        <View style={[styles.row, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={20} color={isDark ? '#ccc' : '#666'} />
          </View>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>All day</Text>
          <Switch
            value={allDay}
            onValueChange={setAllDay}
            trackColor={{ false: isDark ? '#666' : '#ccc', true: '#007bff' }}
            thumbColor="#fff"
          />
        </View>

        {/* Start Date and Time */}
        <View style={[styles.dateTimeContainer, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
          <TouchableOpacity
            style={styles.dateTimeRow}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={[styles.dateTimeText, { color: isDark ? '#fff' : '#000' }]}>
              {formatDate(startDate)}
            </Text>
          </TouchableOpacity>

          <Ionicons name="arrow-forward" size={16} color={isDark ? '#666' : '#999'} />

          <TouchableOpacity
            style={styles.dateTimeRow}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={[styles.dateTimeText, { color: isDark ? '#fff' : '#000' }]}>
              {formatDate(endDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {!allDay && (
          <View style={[styles.timeContainer, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
            <TouchableOpacity
              style={styles.timeRow}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={[styles.timeText, { color: isDark ? '#fff' : '#000' }]}>
                {formatTime(startTime)}
              </Text>
            </TouchableOpacity>

            <Ionicons name="arrow-forward" size={16} color={isDark ? '#666' : '#999'} />

            <TouchableOpacity
              style={styles.timeRow}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={[styles.timeText, { color: isDark ? '#fff' : '#000' }]}>
                {formatTime(endTime)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Priority/Tag Selection */}
        <View style={[styles.row, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="flag-outline" size={20} color={isDark ? '#ccc' : '#666'} />
          </View>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Priority</Text>
        </View>

        <View style={[styles.tagContainer, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
          {(['NONE', 'LOW', 'MEDIUM', 'HIGH'] as TagType[]).map((tagOption) => (
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

        {/* Description */}
        <TouchableOpacity style={[styles.row, { borderBottomColor: isDark ? '#333' : '#ddd' }]} onPress={handleDescriptionPress}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text-outline" size={20} color={isDark ? '#ccc' : '#666'} />
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
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#999'} />
        </TouchableOpacity>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={[styles.bottomContainer, { 
          backgroundColor: isDark ? '#000' : '#fff',
          borderTopColor: isDark ? '#333' : '#ddd'
        }]}>
          <ModernButton
            title="Cancel"
            onPress={() => router.back()}
            style={styles.cancelButtonBottom}
          />
          <ModernButton
            title="Save"
            onPress={handleSave}
            disabled={isLoading}
            style={styles.saveButton}
          />
        </View>
      </KeyboardAvoidingView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
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
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tagIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '500',
    paddingVertical: 15,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 15,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    gap: 20,
  },
  dateTimeRow: {
    flex: 1,
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    gap: 20,
  },
  timeRow: {
    flex: 1,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
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
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
    gap: 15,
    borderTopWidth: 1,
    backgroundColor: 'transparent',
  },
  cancelButtonBottom: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
  },
});

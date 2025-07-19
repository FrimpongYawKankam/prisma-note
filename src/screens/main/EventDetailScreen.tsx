import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernDialog } from '../../components/ui/ModernDialog';
import { ModernButton } from '../../components/ui/ModernButton';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useTheme } from '../../context/ThemeContext';
import { Event, EventTag } from '../../types/api';
import { formatEventDateTime, formatEventTime, getTagColor } from '../../services/eventService';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { getEventById, updateEvent, deleteEvent, eventsLoading } = useEvents();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';

  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [tag, setTag] = useState<EventTag>(EventTag.NONE);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('info');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Date/time picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!id) {
        setMessage('No event ID provided');
        setMessageType('error');
        return;
      }

      try {
        const eventId = parseInt(id as string);
        if (isNaN(eventId)) {
          setMessage('Invalid event ID');
          setMessageType('error');
          return;
        }

        const loadedEvent = await getEventById(eventId);
        setEvent(loadedEvent);
        setTitle(loadedEvent.title);
        setDescription(loadedEvent.description || '');
        setAllDay(loadedEvent.allDay);
        setStartDate(loadedEvent.startDateTime);
        setEndDate(loadedEvent.endDateTime);
        setStartTime(loadedEvent.startDateTime);
        setEndTime(loadedEvent.endDateTime);
        setTag(loadedEvent.tag);
      } catch (error: any) {
        setMessage(error.message || 'Failed to load event.');
        setMessageType('error');
      }
    };
    
    loadEvent();
  }, [id, isAuthenticated, getEventById, router]);

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

  const handleSave = async () => {
    if (!event) return;

    if (!title.trim()) {
      setMessage('Please enter a title for the event');
      setMessageType('error');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const startDateTime = allDay ? startDate : createDateTime(startDate, startTime);
      const endDateTime = allDay ? endDate : createDateTime(endDate, endTime);

      if (endDateTime <= startDateTime) {
        setMessage('End time must be after start time');
        setMessageType('error');
        setSaving(false);
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

      const updatedEvent = await updateEvent(event.id, eventData);
      setEvent(updatedEvent);
      setIsEditing(false);
      setMessage('Event updated successfully!');
      setMessageType('success');
    } catch (error: any) {
      console.error('Failed to update event:', error);
      setMessage(error.message || 'Failed to update event.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!event) return;
    
    // Reset to original values
    setTitle(event.title);
    setDescription(event.description || '');
    setAllDay(event.allDay);
    setStartDate(event.startDateTime);
    setEndDate(event.endDateTime);
    setStartTime(event.startDateTime);
    setEndTime(event.endDateTime);
    setTag(event.tag);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!event) {
      router.back();
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!event) return;
    
    try {
      await deleteEvent(event.id);
      setShowDeleteDialog(false);
      router.back();
    } catch (err: any) {
      setMessage(err.message || 'Failed to delete event.');
      setMessageType('error');
    }
  };

  const handleBack = () => {
    if (isEditing) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  // Show loading if event is being loaded
  if (eventsLoading && id) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={[styles.message, { color: isDark ? '#aaa' : '#444' }]}>Loading event...</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={[styles.message, { color: isDark ? '#aaa' : '#444' }]}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#64ffda' : '#00796b'} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.tagIndicator, { backgroundColor: getTagColor(tag) }]} />
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
            {isEditing ? 'Edit Event' : 'Event Details'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {isEditing ? (
            <>
              <TouchableOpacity onPress={handleCancel} style={styles.iconButton}>
                <Ionicons name="close" size={24} color={isDark ? '#ccc' : '#666'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.iconButton} disabled={saving}>
                <Ionicons name="checkmark" size={24} color={saving ? (isDark ? '#555' : '#ccc') : '#4CAF50'} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconButton}>
                <Ionicons name="create-outline" size={24} color={isDark ? '#64ffda' : '#00796b'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={24} color="#ff5252" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <>
            {/* Title Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={[styles.titleInput, { 
                  color: isDark ? '#fff' : '#000',
                  borderBottomColor: isDark ? '#333' : '#ddd',
                }]}
                placeholder="Event title"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>

            {/* All Day Toggle */}
            <View style={styles.section}>
              <View style={[styles.row, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
                <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>All day</Text>
                <Switch
                  value={allDay}
                  onValueChange={setAllDay}
                  trackColor={{ false: isDark ? '#666' : '#ccc', true: '#007bff' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Date</Text>
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
            </View>

            {/* Time Selection (if not all day) */}
            {!allDay && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Time</Text>
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
              </View>
            )}

            {/* Priority/Tag Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Priority</Text>
              <View style={[styles.tagContainer, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
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

            {/* Description Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={[styles.descriptionInput, { 
                  color: isDark ? '#fff' : '#000',
                  backgroundColor: isDark ? '#111' : '#f9f9f9',
                  borderColor: isDark ? '#333' : '#ddd',
                }]}
                placeholder="Add event description..."
                placeholderTextColor={isDark ? '#666' : '#999'}
                multiline
                textAlignVertical="top"
              />
            </View>
          </>
        ) : (
          /* View Mode */
          <>
            {/* Title */}
            <View style={styles.section}>
              <Text style={[styles.eventTitle, { color: isDark ? '#fff' : '#000' }]}>
                {event.title}
              </Text>
            </View>

            {/* Date and Time Info */}
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={isDark ? '#64ffda' : '#00796b'} />
                <Text style={[styles.infoText, { color: isDark ? '#ccc' : '#666' }]}>
                  {event.allDay ? 'All day' : formatEventTime(event.startDateTime)} - {formatEventTime(event.endDateTime)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={isDark ? '#64ffda' : '#00796b'} />
                <Text style={[styles.infoText, { color: isDark ? '#ccc' : '#666' }]}>
                  {formatEventDateTime(event.startDateTime)}
                </Text>
              </View>
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Ionicons name="flag-outline" size={20} color={getTagColor(event.tag)} />
                <Text style={[styles.infoText, { color: isDark ? '#ccc' : '#666' }]}>
                  Priority: {event.tag}
                </Text>
                <View style={[styles.priorityDot, { backgroundColor: getTagColor(event.tag) }]} />
              </View>
            </View>

            {/* Description */}
            {event.description && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#64ffda' : '#00796b' }]}>
                  Description
                </Text>
                <Text style={[styles.descriptionText, { color: isDark ? '#ccc' : '#666' }]}>
                  {event.description}
                </Text>
              </View>
            )}

            {/* Event Metadata */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#64ffda' : '#00796b' }]}>
                Event Details
              </Text>
              <View style={styles.metadataContainer}>
                <Text style={[styles.metadataText, { color: isDark ? '#888' : '#999' }]}>
                  Created: {formatEventDateTime(event.createdAt)}
                </Text>
                <Text style={[styles.metadataText, { color: isDark ? '#888' : '#999' }]}>
                  Last modified: {formatEventDateTime(event.updatedAt)}
                </Text>
              </View>
            </View>
          </>
        )}
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

      <MessageBox
        message={message}
        type={messageType}
        duration={3000}
      />

      <ModernDialog
        visible={showDeleteDialog}
        title="Delete Event?"
        message="This will permanently delete this event."
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowDeleteDialog(false),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: confirmDelete,
          },
        ]}
        onClose={() => setShowDeleteDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  tagIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '500',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
    flexWrap: 'wrap',
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
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  metadataContainer: {
    marginTop: 10,
  },
  metadataText: {
    fontSize: 14,
    marginBottom: 5,
  },
  message: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

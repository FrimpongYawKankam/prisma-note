import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernDialog } from '../../components/ui/ModernDialog';
import { useEvents } from '../../context/EventsContext';
import { useTheme } from '../../context/ThemeContext';
import { EventTag } from '../../types/api';

export default function EventDetailScreen() {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  const { events, updateEvent, deleteEvent, eventsLoading } = useEvents();
  const { id } = useLocalSearchParams();

  // Find the event
  const event = events.find(e => e.id === Number(id));

  // Form state
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [allDay, setAllDay] = useState(event?.allDay || false);
  const [startDate, setStartDate] = useState<string>(
    typeof event?.startDateTime === 'string' ? event.startDateTime : event?.startDateTime?.toISOString() || new Date().toISOString()
  );
  const [endDate, setEndDate] = useState<string>(
    typeof event?.endDateTime === 'string' ? event.endDateTime : event?.endDateTime?.toISOString() || new Date().toISOString()
  );
  const [startTime, setStartTime] = useState<string>(
    typeof event?.startDateTime === 'string' ? event.startDateTime : event?.startDateTime?.toISOString() || new Date().toISOString()
  );
  const [endTime, setEndTime] = useState<string>(
    typeof event?.endDateTime === 'string' ? event.endDateTime : event?.endDateTime?.toISOString() || new Date().toISOString()
  );
  const [tag, setTag] = useState<EventTag>((event?.tag as EventTag) || EventTag.NONE);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [messageTimeoutId, setMessageTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Date/Time picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setAllDay(event.allDay);
      setStartDate(typeof event.startDateTime === 'string' ? event.startDateTime : event.startDateTime.toISOString());
      setEndDate(typeof event.endDateTime === 'string' ? event.endDateTime : event.endDateTime.toISOString());
      setStartTime(typeof event.startDateTime === 'string' ? event.startDateTime : event.startDateTime.toISOString());
      setEndTime(typeof event.endDateTime === 'string' ? event.endDateTime : event.endDateTime.toISOString());
      setTag(event.tag as EventTag);
    }
  }, [event]);

  // Clear message timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutId) {
        clearTimeout(messageTimeoutId);
      }
    };
  }, [messageTimeoutId]);

  const showMessage = (text: string, type: 'success' | 'error', duration: number = 3000) => {
    // Clear any existing timeout
    if (messageTimeoutId) {
      clearTimeout(messageTimeoutId);
    }
    
    setMessage(text);
    setMessageType(type);
    
    const timeoutId = setTimeout(() => {
      setMessage('');
      setMessageTimeoutId(null);
    }, duration);
    
    setMessageTimeoutId(timeoutId);
  };

  const getTagColor = (tag: EventTag) => {
    const tagColors: { [key in EventTag]: string } = {
      [EventTag.NONE]: '#9E9E9E',
      [EventTag.LOW]: '#4CAF50',
      [EventTag.MEDIUM]: '#FF9800',
      [EventTag.HIGH]: '#F44336',
    };
    return tagColors[tag] || '#9E9E9E';
  };

  const getTagLabel = (tag: EventTag) => {
    const tagLabels: { [key in EventTag]: string } = {
      [EventTag.NONE]: 'None',
      [EventTag.LOW]: 'Low Priority',
      [EventTag.MEDIUM]: 'Medium Priority',
      [EventTag.HIGH]: 'High Priority',
    };
    return tagLabels[tag] || 'None';
  };

  const createDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    const time = new Date(timeString);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return date;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSave = async () => {
    if (!event) return;

    if (!title.trim()) {
      showMessage('Please enter a title for the event', 'error');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const startDateTime = allDay ? new Date(startDate) : createDateTime(startDate, startTime);
      const endDateTime = allDay ? new Date(endDate) : createDateTime(endDate, endTime);

      if (endDateTime <= startDateTime) {
        showMessage('End time must be after start time', 'error');
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

      await updateEvent(event.id, eventData);
      setIsEditing(false);
      showMessage('Event updated successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to update event:', error);
      showMessage(error.message || 'Failed to update event.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAllDayToggle = (value: boolean) => {
    setAllDay(value);
    
    // If setting to all day, automatically set end date to next day at midnight
    if (value) {
      const startDateObj = new Date(startDate);
      const nextDay = new Date(startDateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0); // Set to midnight
      
      setEndDate(nextDay.toISOString());
      setEndTime(nextDay.toISOString());
    }
  };

  const handleCancel = () => {
    if (!event) return;
    
    // Reset to original values
    setTitle(event.title);
    setDescription(event.description || '');
    setAllDay(event.allDay);
    setStartDate(typeof event.startDateTime === 'string' ? event.startDateTime : event.startDateTime.toISOString());
    setEndDate(typeof event.endDateTime === 'string' ? event.endDateTime : event.endDateTime.toISOString());
    setStartTime(typeof event.startDateTime === 'string' ? event.startDateTime : event.startDateTime.toISOString());
    setEndTime(typeof event.endDateTime === 'string' ? event.endDateTime : event.endDateTime.toISOString());
    setTag(event.tag as EventTag);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!event) {
      // Navigate to events tab if no event found
      router.replace('/(tabs)/event');
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!event) return;
    
    try {
      await deleteEvent(event.id);
      setShowDeleteDialog(false);
      // Navigate to events tab instead of trying to go back
      router.replace('/(tabs)/event');
    } catch (err: any) {
      showMessage(err.message || 'Failed to delete event.', 'error');
    }
  };

  const handleBack = () => {
    if (isEditing) {
      setShowBackDialog(true);
    } else {
      // Try to go back, but fallback to events tab if no previous screen
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/event');
      }
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate.toISOString());
      
      // If it's an all-day event, automatically update end date to next day at midnight
      if (allDay) {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        setEndDate(nextDay.toISOString());
        setEndTime(nextDay.toISOString());
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate.toISOString());
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime.toISOString());
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEndTime(selectedTime.toISOString());
    }
  };

  // Show loading if event is being loaded
  if (eventsLoading && id) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
        <Text style={[styles.message, { color: isDark ? '#aaa' : '#666' }]}>Loading event...</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
        <Text style={[styles.message, { color: isDark ? '#aaa' : '#666' }]}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>
            {isEditing ? 'Edit Event' : 'Event Details'}
          </Text>
        </View>

        {/* Status and Actions */}
        <View style={styles.section}>
          <View style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.statusContent}>
              {saving && (
                <Text style={[styles.statusText, { color: colors.primary }]}>
                  Saving...
                </Text>
              )}
              {isEditing && !saving && (
                <Text style={[styles.statusText, { color: isDark ? '#ff9800' : '#f57c00' }]}>
                  Editing mode
                </Text>
              )}
              {!isEditing && !saving && (
                <Text style={[styles.statusText, { color: isDark ? '#4caf50' : '#2e7d32' }]}>
                  Saved
                </Text>
              )}
            </View>
            <View style={styles.actionButtons}>
              {isEditing ? (
                <>
                  <TouchableOpacity 
                    onPress={handleCancel} 
                    style={[styles.actionButton, { backgroundColor: isDark ? '#666' : '#999' }]}
                  >
                    <Ionicons name="close-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleSave} 
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    disabled={saving}
                  >
                    <Ionicons name="checkmark-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    onPress={() => setIsEditing(true)} 
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="create-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleDelete} 
                    style={[styles.actionButton, { backgroundColor: '#e53935' }]}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Event Details Form */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ccc' : '#666' }]}>
              Event Details
            </Text>

            {/* Title Field */}
            <View style={styles.fieldContainer}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={[styles.fieldLabel, { color: isDark ? '#aaa' : '#666' }]}>
                  Title
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#262626' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#333' : '#e0e0e0'
                  }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Event title"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  editable={isEditing}
                />
              </View>
            </View>

            {/* Description Field */}
            <View style={styles.fieldContainer}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="reader-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={[styles.fieldLabel, { color: isDark ? '#aaa' : '#666' }]}>
                  Description
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea, { 
                    backgroundColor: isDark ? '#262626' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#333' : '#e0e0e0',
                    maxWidth: 320,
                  }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Event description"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  multiline
                  editable={isEditing}
                />
              </View>
            </View>

            {/* All Day Toggle */}
            <View style={styles.fieldContainer}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={[styles.fieldLabel, { color: isDark ? '#aaa' : '#666' }]}>
                  All Day Event
                </Text>
                <View style={[styles.toggleContainer, { 
                  backgroundColor: isDark ? '#262626' : '#fff',
                  borderColor: isDark ? '#333' : '#e0e0e0'
                }]}>
                  <Text style={[styles.toggleText, { color: isDark ? '#fff' : '#000' }]}>
                    All Day
                  </Text>
                  <Switch
                    value={allDay}
                    onValueChange={handleAllDayToggle}
                    disabled={!isEditing}
                    trackColor={{ false: '#767577', true: colors.primary }}
                    thumbColor={allDay ? '#fff' : '#f4f3f4'}
                  />
                </View>
                {allDay && (
                  <Text style={[styles.helperText, { color: isDark ? '#666' : '#999', marginTop: 8 }]}>
                    ℹ️ End date automatically set to next day at 12:00 AM
                  </Text>
                )}
              </View>
            </View>

            {/* Start Date Field */}
            <View style={styles.fieldContainer}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={[styles.fieldLabel, { color: isDark ? '#aaa' : '#666' }]}>
                  Start {allDay ? 'Date' : 'Date & Time'}
                </Text>
                <View style={styles.dateTimeRow}>
                  <TouchableOpacity
                    style={[styles.dateTimeInput, { 
                      backgroundColor: isDark ? '#262626' : '#fff',
                      borderColor: isDark ? '#333' : '#e0e0e0',
                      flex: allDay ? 1 : 0.6
                    }]}
                    onPress={() => isEditing && setShowStartDatePicker(true)}
                    disabled={!isEditing}
                  >
                    <Text style={[styles.inputText, { color: isDark ? '#fff' : '#000' }]}>
                      {formatDate(startDate)}
                    </Text>
                  </TouchableOpacity>
                  {!allDay && (
                    <TouchableOpacity
                      style={[styles.dateTimeInput, { 
                        backgroundColor: isDark ? '#262626' : '#fff',
                        borderColor: isDark ? '#333' : '#e0e0e0',
                        flex: 0.35,
                        marginLeft: 8
                      }]}
                      onPress={() => isEditing && setShowStartTimePicker(true)}
                      disabled={!isEditing}
                    >
                      <Text style={[styles.inputText, { color: isDark ? '#fff' : '#000' }]}>
                        {formatTime(startTime)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* End Date Field - Hidden for all-day events */}
            {!allDay && (
              <View style={styles.fieldContainer}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="calendar-clear-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={[styles.fieldLabel, { color: isDark ? '#aaa' : '#666' }]}>
                    End Date & Time
                  </Text>
                  <View style={styles.dateTimeRow}>
                    <TouchableOpacity
                      style={[styles.dateTimeInput, { 
                        backgroundColor: isDark ? '#262626' : '#fff',
                        borderColor: isDark ? '#333' : '#e0e0e0',
                        flex: 0.6
                      }]}
                      onPress={() => isEditing && setShowEndDatePicker(true)}
                      disabled={!isEditing}
                    >
                      <Text style={[styles.inputText, { color: isDark ? '#fff' : '#000' }]}>
                        {formatDate(endDate)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.dateTimeInput, { 
                        backgroundColor: isDark ? '#262626' : '#fff',
                        borderColor: isDark ? '#333' : '#e0e0e0',
                        flex: 0.35,
                        marginLeft: 8
                      }]}
                      onPress={() => isEditing && setShowEndTimePicker(true)}
                      disabled={!isEditing}
                    >
                      <Text style={[styles.inputText, { color: isDark ? '#fff' : '#000' }]}>
                        {formatTime(endTime)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Tag Field */}
            <View style={styles.fieldContainer}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={[styles.fieldLabel, { color: isDark ? '#aaa' : '#666' }]}>
                  Priority Tag
                </Text>
                
                {/* Current Tag Display */}
                <View style={[styles.currentTagDisplay, { 
                  backgroundColor: getTagColor(tag),
                  borderWidth: 0,
                  shadowColor: getTagColor(tag),
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }]}>
                  <View style={[styles.tagIndicator, { backgroundColor: '#fff' }]} />
                  <Text style={[styles.currentTagText, { color: '#fff' }]}>
                    {getTagLabel(tag)}
                  </Text>
                  {!isEditing && (
                    <View style={[styles.readOnlyBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                      <Text style={[styles.readOnlyText, { color: '#fff' }]}>
                        Current
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Tag Options when editing */}
                {isEditing && (
                  <View style={styles.tagOptionsContainer}>
                    <Text style={[styles.tagOptionsLabel, { color: isDark ? '#aaa' : '#666' }]}>
                      Select Priority:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                      {Object.values(EventTag).map((tagOption) => (
                        <TouchableOpacity
                          key={tagOption}
                          style={[
                            styles.tagOption,
                            {
                              backgroundColor: tag === tagOption ? getTagColor(tagOption) : 'rgba(255, 255, 255, 0.1)',
                              borderColor: getTagColor(tagOption),
                              borderWidth: tag === tagOption ? 0 : 2,
                              shadowColor: tag === tagOption ? getTagColor(tagOption) : 'transparent',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: tag === tagOption ? 0.3 : 0,
                              shadowRadius: 4,
                              elevation: tag === tagOption ? 4 : 0,
                            }
                          ]}
                          onPress={() => {
                            const previousTag = tag;
                            setTag(tagOption);
                            // Show brief feedback for tag change
                            if (tagOption !== previousTag) {
                              showMessage(`Priority changed to ${getTagLabel(tagOption)}`, 'success', 2000);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.tagOptionIndicator, { 
                            backgroundColor: tag === tagOption ? '#fff' : getTagColor(tagOption) 
                          }]} />
                          <Text style={[
                            styles.tagOptionText,
                            {
                              color: tag === tagOption ? '#fff' : getTagColor(tagOption),
                              fontWeight: tag === tagOption ? '700' : '500',
                            }
                          ]}>
                            {getTagLabel(tagOption)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Date Picker Modals */}
        {showStartDatePicker && (
          <DateTimePicker
            value={new Date(startDate)}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={new Date(endDate)}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={new Date(startTime)}
            mode="time"
            display="default"
            onChange={onStartTimeChange}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={new Date(endTime)}
            mode="time"
            display="default"
            onChange={onEndTimeChange}
          />
        )}
      </ScrollView>

      {/* Message Box */}
      {message && (
        <View style={styles.messageContainer}>
          <MessageBox
            message={message}
            type={messageType}
            duration={3000}
          />
        </View>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Pressable style={styles.dialogOverlay} onPress={() => setShowDeleteDialog(false)}>
          <Pressable style={[styles.dialogContainer, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]} onPress={(e) => e.stopPropagation()}>
            <ModernDialog
              visible={showDeleteDialog}
              title="Delete Event?"
              message="This action cannot be undone. Are you sure you want to delete this event?"
              buttons={[
                {
                  text: 'Cancel',
                  onPress: () => setShowDeleteDialog(false),
                  style: 'cancel'
                },
                {
                  text: 'Delete',
                  onPress: confirmDelete,
                  style: 'destructive'
                }
              ]}
              onClose={() => setShowDeleteDialog(false)}
            />
          </Pressable>
        </Pressable>
      )}

      {/* Back Confirmation Dialog */}
      {showBackDialog && (
        <Pressable style={styles.dialogOverlay} onPress={() => setShowBackDialog(false)}>
          <Pressable style={[styles.dialogContainer, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]} onPress={(e) => e.stopPropagation()}>
            <ModernDialog
              visible={showBackDialog}
              title="Discard Changes?"
              message="You have unsaved changes. Are you sure you want to go back?"
              buttons={[
                {
                  text: 'Cancel',
                  onPress: () => setShowBackDialog(false),
                  style: 'cancel'
                },
                {
                  text: 'Discard',
                  onPress: () => {
                    setShowBackDialog(false);
                    handleCancel();
                    // Try to go back, but fallback to events tab if no previous screen
                    if (router.canGoBack()) {
                      router.back();
                    } else {
                      router.replace('/(tabs)/event');
                    }
                  },
                  style: 'destructive'
                }
              ]}
              onClose={() => setShowBackDialog(false)}
            />
          </Pressable>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 15
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  fieldContent: {
    flex: 1,
    paddingLeft: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputText: {
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 280,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 280,
  },
  dateTimeInput: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  tagSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 12,
  },
  tagIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  currentTagDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    maxWidth: 280,
  },
  currentTagText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  readOnlyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  readOnlyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagOptionsContainer: {
    marginTop: 8,
    maxWidth: 320,
  },
  tagOptionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  tagScroll: {
    marginTop: 4,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  tagOptionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  tagOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  message: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  messageContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  dialogContainer: {
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

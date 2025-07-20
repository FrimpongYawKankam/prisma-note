import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../../src/context/ThemeContext';
import { useEvents } from '../../src/context/EventsContext';
import { Event, EventTag } from '../../src/types/api';
import { getTagColor, formatEventTime } from '../../src/services/eventService';

export default function EventScreen() {
  const { 
    events, 
    eventsLoading, 
    eventsError, 
    filteredEvents, 
    selectedDate, 
    filterEventsByDate,
    refreshEvents 
  } = useEvents();
  
  const [localSelectedDate, setLocalSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  useEffect(() => {
    // Update context when local selected date changes
    filterEventsByDate(new Date(localSelectedDate));
  }, [localSelectedDate, filterEventsByDate]);

  const formatTime = (date: Date) => {
    return formatEventTime(date);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getEventsForSelectedDate = () => {
    const selectedDateObj = new Date(localSelectedDate);
    const targetDateString = selectedDateObj.toISOString().split('T')[0];
    
    return events.filter(event => {
      const eventDateString = event.startDateTime.toISOString().split('T')[0];
      return eventDateString === targetDateString;
    });
  };

  const markedDates = events.reduce((acc: any, event) => {
    const date = event.startDateTime.toISOString().split('T')[0];
    acc[date] = {
      marked: true,
      dotColor: getTagColor(event.tag),
    };
    return acc;
  }, {});

  // Add selection to marked dates
  markedDates[localSelectedDate] = {
    ...markedDates[localSelectedDate],
    selected: true,
    selectedColor: isDark ? '#4a5568' : '#e2e8f0',
  };

  const displayedEvents = getEventsForSelectedDate();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <View style={styles.dateIndicator}>
          <Text style={[styles.dateText, { color: isDark ? '#fff' : '#000' }]}>
            {new Date().getDate()}
          </Text>
        </View>
      </View>

      {/* Calendar */}
      <Calendar
        onDayPress={(day) => setLocalSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: isDark ? '#000' : '#fff',
          calendarBackground: isDark ? '#000' : '#fff',
          dayTextColor: isDark ? '#fff' : '#000',
          monthTextColor: isDark ? '#fff' : '#000',
          selectedDayTextColor: '#fff',
          arrowColor: isDark ? '#fff' : '#000',
          textSectionTitleColor: isDark ? '#64b5f6' : '#1e88e5',
          todayTextColor: isDark ? '#64ffda' : '#007bff',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
        }}
        style={styles.calendar}
      />

      {/* Selected Date Events */}
      <View style={styles.selectedDateContainer}>
        <Text style={[styles.selectedDateText, { color: isDark ? '#fff' : '#000' }]}>
          {new Date(selectedDate).getDate()} {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
        </Text>
      </View>

      {/* Events List */}
      <ScrollView style={styles.eventsContainer} showsVerticalScrollIndicator={false}>
        {displayedEvents.length === 0 ? (
          <Text style={[styles.noEventsText, { color: isDark ? '#666' : '#999' }]}>
            No events for this date
          </Text>
        ) : (
          displayedEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[styles.eventItem, { borderLeftColor: getTagColor(event.tag) }]}
              onPress={() => router.push(`/event-detail?id=${event.id}`)}
            >
              <Text style={[styles.eventTime, { color: isDark ? '#ccc' : '#666' }]}>
                {event.allDay ? 'All day' : formatTime(event.startDateTime)}
              </Text>
              <View style={styles.eventContent}>
                <View style={[styles.eventIndicator, { backgroundColor: getTagColor(event.tag) }]} />
                <View style={styles.eventDetails}>
                  <Text style={[styles.eventTitle, { color: isDark ? '#fff' : '#000' }]}>
                    {event.title}
                  </Text>
                  {!event.allDay && (
                    <Text style={[styles.eventDuration, { color: isDark ? '#ccc' : '#666' }]}>
                      {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add Event Button */}
      <View style={[styles.addEventContainer, { paddingBottom: 30 }]}>
        <TouchableOpacity
          style={[styles.addEventButton, { backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }]}
          onPress={() => router.push(`/set-event?date=${selectedDate}`)}
        >
          <Text style={[styles.addEventText, { color: isDark ? '#ccc' : '#666' }]}>
            Add event on {formatDate(localSelectedDate)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: isDark ? '#2a2a2a' : '#007bff' }]}
          onPress={() => router.push(`/set-event?date=${localSelectedDate}`)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 15,
  },
  dateIndicator: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendar: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  selectedDateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  selectedDateText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  eventTime: {
    fontSize: 16,
    minWidth: 60,
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIndicator: {
    width: 3,
    height: 40,
    marginRight: 15,
    borderRadius: 2,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventDuration: {
    fontSize: 14,
  },
  addEventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  addEventButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  addEventText: {
    fontSize: 16,
  },
  fabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

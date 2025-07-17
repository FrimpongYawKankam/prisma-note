import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../../src/context/ThemeContext';
import axiosInstance from '../../src/utils/axiosInstance';

type Event = {
  id: number;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  startDate: string;
  endDate: string;
  tags?: string[];
};

export default function EventScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { theme } = useTheme();
  const isDark = theme === 'dark' || useColorScheme() === 'dark';

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter((event) => event.startDate.startsWith(selectedDate));

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#000' }]}>Your Events</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: isDark ? '#444' : '#007bff',
          },
        }}
        theme={{
          backgroundColor: isDark ? '#000' : '#fff',
          calendarBackground: isDark ? '#000' : '#fff',
          dayTextColor: isDark ? '#fff' : '#000',
          monthTextColor: isDark ? '#fff' : '#000',
          selectedDayTextColor: '#fff',
          selectedDayBackgroundColor: isDark ? '#444' : '#007bff',
          arrowColor: isDark ? '#fff' : '#000',
          textSectionTitleColor: isDark ? '#64b5f6' : '#1e88e5', // ← blue weekday labels
        }}
      />

      <Text style={[styles.subHeading, { color: isDark ? '#fff' : '#000' }]}>
        Your events for {selectedDate}:
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredEvents.length === 0 ? (
          <Text style={[styles.noEventsText, { color: isDark ? '#ccc' : '#555' }]}>
            No events for this date.
          </Text>
        ) : (
          filteredEvents.map((event) => (
            <View
              key={event.id}
              style={[
                styles.eventItem,
                { backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' },
              ]}
            >
              <Text style={[styles.eventName, { color: isDark ? '#fff' : '#000' }]}>{event.title}</Text>
              <Text style={[styles.eventDetails, { color: isDark ? '#ccc' : '#333' }]}>
                Priority: {event.priority}
              </Text>
              <Text style={[styles.eventDetails, { color: isDark ? '#ccc' : '#333' }]}>
                Time: {new Date(event.startDate).toLocaleTimeString()} -{' '}
                {new Date(event.endDate).toLocaleTimeString()}
              </Text>
              <Text style={[styles.eventDetails, { color: isDark ? '#ccc' : '#333' }]}>
                Tags: {event.tags?.join(', ') || 'None'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    alignSelf: 'center',
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  noEventsText: {
    fontSize: 16,
    alignSelf: 'center',
    marginTop: 20,
  },
  eventItem: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
  },
  eventDetails: {
    fontSize: 14,
    marginTop: 4,
  },
});

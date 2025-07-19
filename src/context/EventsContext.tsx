import React, { createContext, useContext, useEffect, useState } from 'react';
import eventService from '../services/eventService';
import { CreateEventRequest, Event, EventTag, UpdateEventRequest } from '../types/api';
import { useAuth } from './AuthContext';

interface EventsContextType {
  // Events state
  events: Event[];
  eventsLoading: boolean;
  eventsError: string | null;
  eventsCount: number;
  
  // Filtered events state
  filteredEvents: Event[];
  selectedDate: Date;
  selectedTag: EventTag | null;
  
  // Event operations
  createEvent: (eventData: CreateEventRequest) => Promise<Event>;
  updateEvent: (eventId: number, eventData: UpdateEventRequest) => Promise<Event>;
  deleteEvent: (eventId: number) => Promise<void>;
  getEventById: (eventId: number) => Promise<Event>;
  refreshEvents: () => Promise<void>;
  clearError: () => void;
  
  // Filtering and search
  filterEventsByDate: (date: Date) => void;
  filterEventsByTag: (tag: EventTag | null) => void;
  getEventsForDate: (date: Date) => Event[];
  getOverlappingEvents: (startDate: Date, endDate: Date) => Promise<Event[]>;
  
  // Tag operations
  updateEventTag: (eventId: number, tag: EventTag) => Promise<Event>;
  removeEventTag: (eventId: number) => Promise<void>;
  getEventsByTag: (tag: EventTag) => Promise<Event[]>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventsCount, setEventsCount] = useState(0);
  
  // Filtered events state
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTag, setSelectedTag] = useState<EventTag | null>(null);
  
  const { isAuthenticated } = useAuth();

  // Add a flag to prevent multiple simultaneous loads
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // Load events when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialLoading) {
      setIsInitialLoading(true);
      refreshEvents().finally(() => {
        setIsInitialLoading(false);
      });
    } else if (!isAuthenticated) {
      // Clear events when user logs out
      setEvents([]);
      setEventsCount(0);
      setFilteredEvents([]);
      setIsInitialLoading(false);
    }
  }, [isAuthenticated]);

  // Update filtered events when events, selectedDate, or selectedTag changes
  useEffect(() => {
    applyFilters();
  }, [events, selectedDate, selectedTag]);

  const refreshEvents = async () => {
    if (!isAuthenticated || eventsLoading) return;
    
    // Debounce: Don't refresh if we've refreshed in the last 5 seconds
    const now = Date.now();
    if (now - lastRefreshTime < 5000) {
      console.log('Skipping events refresh - too recent');
      return;
    }
    
    try {
      setEventsLoading(true);
      setEventsError(null);
      setLastRefreshTime(now);
      const userEvents = await eventService.getUserEvents();
      setEvents(userEvents);
      setEventsCount(userEvents.length);
    } catch (err: any) {
      console.error('Failed to refresh events:', err);
      setEventsError(err.message || 'Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];
    
    // Filter by selected date
    if (selectedDate) {
      const targetDate = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(event => {
        const eventDate = event.startDateTime.toISOString().split('T')[0];
        return eventDate === targetDate;
      });
    }
    
    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(event => event.tag === selectedTag);
    }
    
    setFilteredEvents(filtered);
  };

  const createEvent = async (eventData: CreateEventRequest): Promise<Event> => {
    try {
      setEventsError(null);
      const newEvent = await eventService.createEvent(eventData);
      
      // Add the new event to the list
      setEvents(prevEvents => [...prevEvents, newEvent]);
      setEventsCount(prevCount => prevCount + 1);
      
      return newEvent;
    } catch (err: any) {
      console.error('Failed to create event:', err);
      setEventsError(err.message || 'Failed to create event');
      throw err;
    }
  };

  const updateEvent = async (eventId: number, eventData: UpdateEventRequest): Promise<Event> => {
    try {
      setEventsError(null);
      const updatedEvent = await eventService.updateEvent(eventId, eventData);
      
      // Update the event in the list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId ? updatedEvent : event
        )
      );
      
      return updatedEvent;
    } catch (err: any) {
      console.error('Failed to update event:', err);
      setEventsError(err.message || 'Failed to update event');
      throw err;
    }
  };

  const deleteEvent = async (eventId: number): Promise<void> => {
    try {
      setEventsError(null);
      await eventService.deleteEvent(eventId);
      
      // Remove the event from the list
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      setEventsCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      setEventsError(err.message || 'Failed to delete event');
      throw err;
    }
  };

  const getEventById = async (eventId: number): Promise<Event> => {
    try {
      setEventsError(null);
      
      // First, try to find the event in our local state
      const localEvent = events.find(event => event.id === eventId);
      if (localEvent) {
        return localEvent;
      }
      
      // If not found locally, fetch from server
      const event = await eventService.getEventById(eventId);
      return event;
    } catch (err: any) {
      console.error('Failed to get event by ID:', err);
      setEventsError(err.message || 'Failed to load event');
      throw err;
    }
  };

  const filterEventsByDate = (date: Date) => {
    setSelectedDate(date);
  };

  const filterEventsByTag = (tag: EventTag | null) => {
    setSelectedTag(tag);
  };

  const getEventsForDate = (date: Date): Event[] => {
    return eventService.getEventsForDate(events, date);
  };

  const getOverlappingEvents = async (startDate: Date, endDate: Date): Promise<Event[]> => {
    try {
      setEventsError(null);
      const overlappingEvents = await eventService.getOverlappingEvents(startDate, endDate);
      return overlappingEvents;
    } catch (err: any) {
      console.error('Failed to get overlapping events:', err);
      setEventsError(err.message || 'Failed to get overlapping events');
      throw err;
    }
  };

  const updateEventTag = async (eventId: number, tag: EventTag): Promise<Event> => {
    try {
      setEventsError(null);
      const updatedEvent = await eventService.updateEventTag(eventId, tag);
      
      // Update the event in the list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId ? updatedEvent : event
        )
      );
      
      return updatedEvent;
    } catch (err: any) {
      console.error('Failed to update event tag:', err);
      setEventsError(err.message || 'Failed to update event tag');
      throw err;
    }
  };

  const removeEventTag = async (eventId: number): Promise<void> => {
    try {
      setEventsError(null);
      await eventService.removeEventTag(eventId);
      
      // Update the event in the list to have NONE tag
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId ? { ...event, tag: EventTag.NONE } : event
        )
      );
    } catch (err: any) {
      console.error('Failed to remove event tag:', err);
      setEventsError(err.message || 'Failed to remove event tag');
      throw err;
    }
  };

  const getEventsByTag = async (tag: EventTag): Promise<Event[]> => {
    try {
      setEventsError(null);
      const taggedEvents = await eventService.getEventsByTag(tag);
      return taggedEvents;
    } catch (err: any) {
      console.error('Failed to get events by tag:', err);
      setEventsError(err.message || 'Failed to get events by tag');
      throw err;
    }
  };

  const clearError = () => {
    setEventsError(null);
  };

  const value: EventsContextType = {
    // Events state
    events,
    eventsLoading,
    eventsError,
    eventsCount,
    
    // Filtered events state
    filteredEvents,
    selectedDate,
    selectedTag,
    
    // Event operations
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    refreshEvents,
    clearError,
    
    // Filtering and search
    filterEventsByDate,
    filterEventsByTag,
    getEventsForDate,
    getOverlappingEvents,
    
    // Tag operations
    updateEventTag,
    removeEventTag,
    getEventsByTag,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = (): EventsContextType => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

export default EventsContext;

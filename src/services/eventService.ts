import {
  CreateEventRequest,
  Event,
  EventResponse,
  EventSearchParams,
  EventTag,
  UpdateEventRequest
} from '../types/api';
import axiosInstance from '../utils/axiosInstance';
import { cancelEventNotifications, scheduleEventNotifications } from './notificationService';

// Utility function to convert backend date strings to Date objects
const convertEventResponse = (eventResponse: EventResponse): Event => ({
  ...eventResponse,
  startDateTime: new Date(eventResponse.startDateTime),
  endDateTime: new Date(eventResponse.endDateTime),
  createdAt: new Date(eventResponse.createdAt),
  updatedAt: new Date(eventResponse.updatedAt),
});

// ============================================
// EVENT CRUD OPERATIONS
// ============================================

/**
 * Creates a new event for the authenticated user
 */
export const createEvent = async (eventData: CreateEventRequest): Promise<Event> => {
  try {
    const response = await axiosInstance.post<EventResponse>('/api/events', eventData);
    console.log('Create event response:', response.data);
    const event = convertEventResponse(response.data);
    
    // Schedule notifications for the new event
    try {
      await scheduleEventNotifications(
        event.startDateTime,
        event.title,
        event.description
      );
      console.log('✅ Notifications scheduled for event:', event.title);
    } catch (notificationError) {
      console.error('⚠️ Failed to schedule notifications:', notificationError);
      // Don't throw here - event creation should succeed even if notifications fail
    }
    
    return event;
  } catch (error: any) {
    console.error('Create event error:', error);
    
    if (error.response?.status === 400) {
      throw new Error('Invalid event data. Please check your input.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to create event. Please try again.');
    }
  }
};

/**
 * Retrieves all events for the authenticated user with optional filters
 */
export const getUserEvents = async (params?: EventSearchParams): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get<EventResponse[]>('/api/events', {
      params: params
    });
    console.log('Get user events response:', response.data);
    return response.data.map(convertEventResponse);
  } catch (error: any) {
    console.error('Get user events error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch events. Please try again.');
    }
  }
};

/**
 * Retrieves a specific event by its ID
 */
export const getEventById = async (eventId: number): Promise<Event> => {
  try {
    const response = await axiosInstance.get<EventResponse>(`/api/events/${eventId}`);
    console.log('Get event by ID response:', response.data);
    return convertEventResponse(response.data);
  } catch (error: any) {
    console.error('Get event by ID error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Event not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to access this event.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch event. Please try again.');
    }
  }
};

/**
 * Updates an existing event by its ID
 */
export const updateEvent = async (eventId: number, eventData: UpdateEventRequest): Promise<Event> => {
  try {
    const response = await axiosInstance.put<EventResponse>(`/api/events/${eventId}`, eventData);
    console.log('Update event response:', response.data);
    const event = convertEventResponse(response.data);
    
    // Cancel old notifications and schedule new ones if event time changed
    try {
      // Cancel existing notifications for this event
      await cancelEventNotifications(event.startDateTime);
      
      // Schedule new notifications
      await scheduleEventNotifications(
        event.startDateTime,
        event.title,
        event.description
      );
      console.log('✅ Notifications rescheduled for updated event:', event.title);
    } catch (notificationError) {
      console.error('⚠️ Failed to reschedule notifications:', notificationError);
      // Don't throw here - event update should succeed even if notifications fail
    }
    
    return event;
  } catch (error: any) {
    console.error('Update event error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Event not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to edit this event.');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid event data. Please check your input.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to update event. Please try again.');
    }
  }
};

/**
 * Deletes an event by its ID
 */
export const deleteEvent = async (eventId: number): Promise<void> => {
  try {
    // Get event details first to cancel notifications
    let eventDate: Date | null = null;
    try {
      const event = await getEventById(eventId);
      eventDate = event.startDateTime;
    } catch (getError) {
      console.warn('Could not get event details for notification cancellation:', getError);
    }
    
    // Delete the event
    await axiosInstance.delete(`/api/events/${eventId}`);
    console.log('Event deleted successfully:', eventId);
    
    // Cancel notifications if we got the event date
    if (eventDate) {
      try {
        await cancelEventNotifications(eventDate);
        console.log('✅ Notifications cancelled for deleted event');
      } catch (notificationError) {
        console.error('⚠️ Failed to cancel notifications:', notificationError);
        // Don't throw here - event deletion should succeed even if notification cancellation fails
      }
    }
  } catch (error: any) {
    console.error('Delete event error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Event not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete this event.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to delete event. Please try again.');
    }
  }
};

// ============================================
// EVENT SEARCH AND FILTER OPERATIONS
// ============================================

/**
 * Gets events that overlap with the specified date and time range
 */
export const getOverlappingEvents = async (startDateTime: Date, endDateTime: Date): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get<EventResponse[]>('/api/events/overlapping', {
      params: {
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString()
      }
    });
    console.log('Get overlapping events response:', response.data);
    return response.data.map(convertEventResponse);
  } catch (error: any) {
    console.error('Get overlapping events error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch overlapping events. Please try again.');
    }
  }
};

/**
 * Gets events filtered by a specific tag
 */
export const getEventsByTag = async (tag: EventTag): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get<EventResponse[]>(`/api/events/tag/${tag}`);
    console.log('Get events by tag response:', response.data);
    return response.data.map(convertEventResponse);
  } catch (error: any) {
    console.error('Get events by tag error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch events by tag. Please try again.');
    }
  }
};

// ============================================
// EVENT TAG OPERATIONS
// ============================================

/**
 * Updates the tag of an existing event
 */
export const updateEventTag = async (eventId: number, tag: EventTag): Promise<Event> => {
  try {
    const response = await axiosInstance.patch<EventResponse>(`/api/events/${eventId}/tag`, null, {
      params: { tag }
    });
    console.log('Update event tag response:', response.data);
    return convertEventResponse(response.data);
  } catch (error: any) {
    console.error('Update event tag error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Event not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to edit this event.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to update event tag. Please try again.');
    }
  }
};

/**
 * Removes the tag from an event (sets to NONE)
 */
export const removeEventTag = async (eventId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/events/${eventId}/tag`);
    console.log('Event tag removed successfully:', eventId);
  } catch (error: any) {
    console.error('Remove event tag error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Event not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to edit this event.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to remove event tag. Please try again.');
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Checks if an event belongs to the current user
 */
export const isEventOwner = (event: Event, userId: number): boolean => {
  return event.userId === userId;
};

/**
 * Formats event date and time for display
 */
export const formatEventDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formats event time only for display
 */
export const formatEventTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Gets the color associated with an event tag
 */
export const getTagColor = (tag: EventTag): string => {
  switch (tag) {
    case EventTag.HIGH:
      return '#ff4757';
    case EventTag.MEDIUM:
      return '#ffa502';
    case EventTag.LOW:
      return '#2ed573';
    case EventTag.NONE:
    default:
      return '#70a1ff';
  }
};

/**
 * Checks if two events overlap
 */
export const eventsOverlap = (event1: Event, event2: Event): boolean => {
  return (
    event1.startDateTime < event2.endDateTime &&
    event2.startDateTime < event1.endDateTime
  );
};

/**
 * Gets events for a specific date
 */
export const getEventsForDate = (events: Event[], date: Date): Event[] => {
  const targetDate = date.toISOString().split('T')[0];
  return events.filter(event => {
    const eventDate = event.startDateTime.toISOString().split('T')[0];
    return eventDate === targetDate;
  });
};

/**
 * Validates event data before creation/update
 */
export const validateEventData = (eventData: CreateEventRequest | UpdateEventRequest): string[] => {
  const errors: string[] = [];
  
  if ('title' in eventData) {
    if (!eventData.title || eventData.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (eventData.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }
  }
  
  if (eventData.description && eventData.description.length > 1000) {
    errors.push('Description must be less than 1,000 characters');
  }
  
  if ('startDateTime' in eventData && 'endDateTime' in eventData) {
    const startDate = new Date(eventData.startDateTime!);
    const endDate = new Date(eventData.endDateTime!);
    
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }
  }
  
  return errors;
};

/**
 * Converts a Date object to ISO string for API requests
 */
export const dateToISOString = (date: Date): string => {
  return date.toISOString();
};

/**
 * Converts ISO string to Date object
 */
export const isoStringToDate = (isoString: string): Date => {
  return new Date(isoString);
};

export default {
  createEvent,
  getUserEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getOverlappingEvents,
  getEventsByTag,
  updateEventTag,
  removeEventTag,
  isEventOwner,
  formatEventDateTime,
  formatEventTime,
  getTagColor,
  eventsOverlap,
  getEventsForDate,
  validateEventData,
  dateToISOString,
  isoStringToDate
};

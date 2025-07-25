import {
  CreateNoteRequest,
  Note,
  NoteResponse,
  UpdateNoteRequest
} from '../types/api';
import axiosInstance from '../utils/axiosInstance';

// Utility function to convert backend date strings to Date objects
const convertNoteResponse = (noteResponse: NoteResponse): Note => ({
  ...noteResponse,
  timeCreated: new Date(noteResponse.timeCreated),
  lastModified: new Date(noteResponse.lastModified),
});

// ============================================
// NOTE CRUD OPERATIONS
// ============================================

/**
 * Creates a new note for the authenticated user
 */
export const createNote = async (noteData: CreateNoteRequest): Promise<Note> => {
  try {
    const response = await axiosInstance.post<NoteResponse>('/api/notes', noteData);
    console.log('Create note response:', response.data);
    return convertNoteResponse(response.data);
  } catch (error: any) {
    console.error('Create note error:', error);
    
    if (error.response?.status === 400) {
      throw new Error('Invalid note data. Please check your input.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to create note. Please try again.');
    }
  }
};

/**
 * Retrieves all notes for the authenticated user
 */
export const getUserNotes = async (): Promise<Note[]> => {
  try {
    const response = await axiosInstance.get<NoteResponse[]>('/api/notes');
    console.log('Get user notes response:', response.data);
    
    // Defensive programming: handle undefined or non-array response
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('Invalid notes response data format:', response.data);
      return [];
    }
    
    return response.data.map(convertNoteResponse);
  } catch (error: any) {
    console.error('Get user notes error:', error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch notes. Please try again.');
    }
  }
};

/**
 * Retrieves a specific note by its ID
 */
export const getNoteById = async (noteId: number): Promise<Note> => {
  try {
    const response = await axiosInstance.get<NoteResponse>(`/api/notes/${noteId}`);
    console.log('Get note by ID response:', response.data);
    return convertNoteResponse(response.data);
  } catch (error: any) {
    console.error('Get note by ID error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Note not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to access this note.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch note. Please try again.');
    }
  }
};

/**
 * Updates an existing note by its ID
 */
export const updateNote = async (noteId: number, noteData: UpdateNoteRequest): Promise<Note> => {
  try {
    const response = await axiosInstance.put<NoteResponse>(`/api/notes/${noteId}`, noteData);
    console.log('Update note response:', response.data);
    return convertNoteResponse(response.data);
  } catch (error: any) {
    console.error('Update note error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Note not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to edit this note.');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid note data. Please check your input.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to update note. Please try again.');
    }
  }
};

/**
 * Deletes a note by its ID
 */
export const deleteNote = async (noteId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/notes/${noteId}`);
    console.log('Note deleted successfully:', noteId);
  } catch (error: any) {
    console.error('Delete note error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Note not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete this note.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to delete note. Please try again.');
    }
  }
};

// ============================================
// NOTE SEARCH AND UTILITIES
// ============================================

/**
 * Searches for notes containing the specified keyword
 */
export const searchNotes = async (keyword: string): Promise<Note[]> => {
  try {
    const response = await axiosInstance.get<NoteResponse[]>('/api/notes/search', {
      params: { keyword }
    });
    console.log('Search notes response:', response.data);
    
    // Defensive programming: handle undefined or non-array response
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('Invalid search notes response data format:', response.data);
      return [];
    }
    
    return response.data.map(convertNoteResponse);
  } catch (error: any) {
    console.error('Search notes error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to search notes. Please try again.');
    }
  }
};

/**
 * Gets the count of notes for the authenticated user
 */
export const getUserNotesCount = async (): Promise<number> => {
  try {
    const response = await axiosInstance.get<number>('/api/notes/count');
    console.log('Get notes count response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get notes count error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to get notes count. Please try again.');
    }
  }
};

// ============================================
// TRASH MANAGEMENT OPERATIONS
// ============================================

/**
 * Gets all trashed notes for the authenticated user
 */
export const getTrashedNotes = async (): Promise<Note[]> => {
  try {
    const response = await axiosInstance.get<NoteResponse[]>('/api/notes/trash');
    console.log('Get trashed notes response:', response.data);
    
    // Defensive programming: handle undefined or non-array response
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('Invalid trashed notes response data format:', response.data);
      return [];
    }
    
    return response.data.map(convertNoteResponse);
  } catch (error: any) {
    console.error('Get trashed notes error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch trashed notes. Please try again.');
    }
  }
};

/**
 * Restores a note from trash
 */
export const restoreNote = async (noteId: number): Promise<void> => {
  try {
    await axiosInstance.patch(`/api/notes/${noteId}/restore`);
    console.log('Note restored successfully:', noteId);
  } catch (error: any) {
    console.error('Restore note error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Note not found in trash.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to restore this note.');
    } else if (error.response?.status === 400) {
      throw new Error('Note is not in trash or cannot be restored.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to restore note. Please try again.');
    }
  }
};

/**
 * Permanently deletes a note (only works on trashed notes)
 */
export const permanentlyDeleteNote = async (noteId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/notes/${noteId}/permanent`);
    console.log('Note permanently deleted:', noteId);
  } catch (error: any) {
    console.error('Permanently delete note error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Note not found in trash.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete this note.');
    } else if (error.response?.status === 400) {
      throw new Error('Note must be in trash before permanent deletion.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to permanently delete note. Please try again.');
    }
  }
};

/**
 * Empties the entire trash (permanently deletes all trashed notes)
 */
export const emptyTrash = async (): Promise<void> => {
  try {
    await axiosInstance.delete('/api/notes/trash/empty');
    console.log('Trash emptied successfully');
  } catch (error: any) {
    console.error('Empty trash error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to empty trash. Please try again.');
    }
  }
};

/**
 * Searches through trashed notes
 */
export const searchTrashedNotes = async (keyword: string): Promise<Note[]> => {
  try {
    if (!keyword.trim()) {
      return [];
    }
    
    const response = await axiosInstance.get<NoteResponse[]>('/api/notes/trash/search', {
      params: { keyword: keyword.trim() }
    });
    console.log('Search trashed notes response:', response.data);
    
    // Defensive programming: handle undefined or non-array response
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('Invalid search trashed notes response data format:', response.data);
      return [];
    }
    
    return response.data.map(convertNoteResponse);
  } catch (error: any) {
    console.error('Search trashed notes error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to search trashed notes. Please try again.');
    }
  }
};

/**
 * Gets the count of trashed notes
 */
export const getTrashedNotesCount = async (): Promise<number> => {
  try {
    const response = await axiosInstance.get<number>('/api/notes/trash/count');
    console.log('Trashed notes count:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get trashed notes count error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to get trashed notes count. Please try again.');
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Checks if a note belongs to the current user
 */
export const isNoteOwner = (note: Note, userEmail: string): boolean => {
  return note.ownerEmail === userEmail;
};

/**
 * Formats note creation/modification dates for display
 */
export const formatNoteDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Gets a preview of note content (first N characters)
 */
export const getNotePreview = (content: string, maxLength: number = 100): string => {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
};

/**
 * Validates note data before creation/update
 */
export const validateNoteData = (noteData: CreateNoteRequest | UpdateNoteRequest): string[] => {
  const errors: string[] = [];
  
  if ('title' in noteData) {
    if (!noteData.title || noteData.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (noteData.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }
  }
  
  if (noteData.content && noteData.content.length > 10000) {
    errors.push('Content must be less than 10,000 characters');
  }
  
  return errors;
};

export default {
  createNote,
  getUserNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
  getUserNotesCount,
  getTrashedNotes,
  restoreNote,
  permanentlyDeleteNote,
  emptyTrash,
  searchTrashedNotes,
  getTrashedNotesCount,
  isNoteOwner,
  formatNoteDate,
  getNotePreview,
  validateNoteData
};

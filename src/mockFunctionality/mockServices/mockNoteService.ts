import {
    CreateNoteRequest,
    Note,
    NoteResponse,
    UpdateNoteRequest
} from '../../types/api';
import { convertToFrontendNotes, mockNotesData } from '../mockData/notes';
import { mockUser } from '../mockData/users';
import { MOCK_CONFIG, MOCK_RESPONSES } from '../utils/constants';
import { createMockDate, createMockError, generateMockId, mockStorage, simulateDelay } from '../utils/mockUtils';

/**
 * Mock Note Service - Simulates backend note operations
 */
export const mockNoteService = {
  /**
   * Initialize mock notes data
   */
  initializeNotes: async () => {
    const existingNotes = await mockStorage.get<NoteResponse[]>(MOCK_CONFIG.STORAGE_KEYS.MOCK_NOTES);
    if (!existingNotes) {
      await mockStorage.set(MOCK_CONFIG.STORAGE_KEYS.MOCK_NOTES, mockNotesData);
    }
  },

  /**
   * Check if user is authenticated
   */
  checkAuth: async () => {
    const token = await mockStorage.get<string>(MOCK_CONFIG.STORAGE_KEYS.MOCK_AUTH_TOKEN);
    if (!token) {
      throw createMockError(MOCK_RESPONSES.ERROR_MESSAGES.UNAUTHORIZED, 401);
    }
  },

  /**
   * Get all stored notes
   */
  getStoredNotes: async (): Promise<NoteResponse[]> => {
    const notes = await mockStorage.get<NoteResponse[]>(MOCK_CONFIG.STORAGE_KEYS.MOCK_NOTES);
    return notes || mockNotesData;
  },

  /**
   * Update stored notes
   */
  updateStoredNotes: async (notes: NoteResponse[]) => {
    await mockStorage.set(MOCK_CONFIG.STORAGE_KEYS.MOCK_NOTES, notes);
  },

  /**
   * Create a new note
   */
  createNote: async (noteData: CreateNoteRequest): Promise<Note> => {
    await simulateDelay('NOTES');
    await mockNoteService.checkAuth();
    
    const notes = await mockNoteService.getStoredNotes();
    
    const newNoteResponse: NoteResponse = {
      id: generateMockId(),
      title: noteData.title,
      content: noteData.content || '',
      timeCreated: createMockDate(0),
      lastModified: createMockDate(0),
      ownerName: mockUser.fullName,
      ownerEmail: mockUser.email
    };
    
    const updatedNotes = [newNoteResponse, ...notes];
    await mockNoteService.updateStoredNotes(updatedNotes);
    
    // Convert to frontend format
    const newNote: Note = {
      ...newNoteResponse,
      timeCreated: new Date(newNoteResponse.timeCreated),
      lastModified: new Date(newNoteResponse.lastModified)
    };
    
    return newNote;
  },

  /**
   * Get all user notes
   */
  getUserNotes: async (): Promise<Note[]> => {
    await simulateDelay('NOTES');
    await mockNoteService.checkAuth();
    
    await mockNoteService.initializeNotes();
    const notes = await mockNoteService.getStoredNotes();
    
    return convertToFrontendNotes(notes);
  },

  /**
   * Get note by ID
   */
  getNoteById: async (noteId: number): Promise<Note> => {
    await simulateDelay('NOTES');
    await mockNoteService.checkAuth();
    
    const notes = await mockNoteService.getStoredNotes();
    const note = notes.find(n => n.id === noteId);
    
    if (!note) {
      throw createMockError(MOCK_RESPONSES.ERROR_MESSAGES.NOTE_NOT_FOUND, 404);
    }
    
    return {
      ...note,
      timeCreated: new Date(note.timeCreated),
      lastModified: new Date(note.lastModified)
    };
  },

  /**
   * Update a note
   */
  updateNote: async (noteId: number, noteData: UpdateNoteRequest): Promise<Note> => {
    await simulateDelay('NOTES');
    await mockNoteService.checkAuth();
    
    const notes = await mockNoteService.getStoredNotes();
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    if (noteIndex === -1) {
      throw createMockError(MOCK_RESPONSES.ERROR_MESSAGES.NOTE_NOT_FOUND, 404);
    }
    
    const updatedNoteResponse: NoteResponse = {
      ...notes[noteIndex],
      ...(noteData.title && { title: noteData.title }),
      ...(noteData.content !== undefined && { content: noteData.content }),
      lastModified: createMockDate(0)
    };
    
    const updatedNotes = [...notes];
    updatedNotes[noteIndex] = updatedNoteResponse;
    await mockNoteService.updateStoredNotes(updatedNotes);
    
    return {
      ...updatedNoteResponse,
      timeCreated: new Date(updatedNoteResponse.timeCreated),
      lastModified: new Date(updatedNoteResponse.lastModified)
    };
  },

  /**
   * Delete a note
   */
  deleteNote: async (noteId: number): Promise<void> => {
    await simulateDelay('NOTES');
    await mockNoteService.checkAuth();
    
    const notes = await mockNoteService.getStoredNotes();
    const noteExists = notes.some(n => n.id === noteId);
    
    if (!noteExists) {
      throw createMockError(MOCK_RESPONSES.ERROR_MESSAGES.NOTE_NOT_FOUND, 404);
    }
    
    const updatedNotes = notes.filter(n => n.id !== noteId);
    await mockNoteService.updateStoredNotes(updatedNotes);
  },

  /**
   * Search notes
   */
  searchNotes: async (keyword: string): Promise<Note[]> => {
    await simulateDelay('SEARCH');
    await mockNoteService.checkAuth();
    
    const notes = await mockNoteService.getStoredNotes();
    const searchTerm = keyword.toLowerCase();
    
    const filteredNotes = notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      (note.content && note.content.toLowerCase().includes(searchTerm))
    );
    
    return convertToFrontendNotes(filteredNotes);
  },

  /**
   * Get notes count
   */
  getUserNotesCount: async (): Promise<number> => {
    await simulateDelay('NOTES');
    await mockNoteService.checkAuth();
    
    const notes = await mockNoteService.getStoredNotes();
    return notes.length;
  },

  // Utility functions that don't need mocking
  isNoteOwner: (note: Note, userEmail: string): boolean => {
    return note.ownerEmail === userEmail;
  },

  formatNoteDate: (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getNotePreview: (content: string, maxLength: number = 100): string => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  },

  validateNoteData: (noteData: CreateNoteRequest | UpdateNoteRequest): string[] => {
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
  }
};

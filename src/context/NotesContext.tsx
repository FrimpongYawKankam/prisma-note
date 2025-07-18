import React, { createContext, useContext, useEffect, useState } from 'react';
import { createNoteService } from '../mockFunctionality';
import { CreateNoteRequest, Note, UpdateNoteRequest } from '../types/api';
import { useAuth } from './AuthContext';

// Use service factory to get appropriate service
const noteService = createNoteService();

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  error: string | null;
  notesCount: number;
  
  // CRUD operations
  createNote: (noteData: CreateNoteRequest) => Promise<Note>;
  updateNote: (noteId: number, noteData: UpdateNoteRequest) => Promise<Note>;
  deleteNote: (noteId: number) => Promise<void>;
  getNoteById: (noteId: number) => Promise<Note>;
  
  // Search and utilities
  searchNotes: (keyword: string) => Promise<Note[]>;
  refreshNotes: () => Promise<void>;
  clearError: () => void;
  
  // Search state
  searchResults: Note[];
  isSearching: boolean;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  clearSearch: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesCount, setNotesCount] = useState(0);
  
  // Search state
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const { isAuthenticated, user } = useAuth();

  // Load notes when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshNotes();
      loadNotesCount();
    } else {
      // Clear notes when user logs out
      setNotes([]);
      setNotesCount(0);
      clearSearch();
    }
  }, [isAuthenticated]);

  const refreshNotes = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const userNotes = await noteService.getUserNotes();
      setNotes(userNotes);
    } catch (err: any) {
      console.error('Failed to refresh notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const loadNotesCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const count = await noteService.getUserNotesCount();
      setNotesCount(count);
    } catch (err: any) {
      console.error('Failed to load notes count:', err);
    }
  };

  const createNote = async (noteData: CreateNoteRequest): Promise<Note> => {
    try {
      setError(null);
      const newNote = await noteService.createNote(noteData);
      
      // Add the new note to the beginning of the list
      setNotes(prevNotes => [newNote, ...prevNotes]);
      setNotesCount(prevCount => prevCount + 1);
      
      return newNote;
    } catch (err: any) {
      console.error('Failed to create note:', err);
      setError(err.message || 'Failed to create note');
      throw err;
    }
  };

  const updateNote = async (noteId: number, noteData: UpdateNoteRequest): Promise<Note> => {
    try {
      setError(null);
      const updatedNote = await noteService.updateNote(noteId, noteData);
      
      // Update the note in the list
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? updatedNote : note
        )
      );
      
      // Update in search results if present
      setSearchResults(prevResults => 
        prevResults.map(note => 
          note.id === noteId ? updatedNote : note
        )
      );
      
      return updatedNote;
    } catch (err: any) {
      console.error('Failed to update note:', err);
      setError(err.message || 'Failed to update note');
      throw err;
    }
  };

  const deleteNote = async (noteId: number): Promise<void> => {
    try {
      setError(null);
      await noteService.deleteNote(noteId);
      
      // Remove the note from the list
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      setNotesCount(prevCount => Math.max(0, prevCount - 1));
      
      // Remove from search results if present
      setSearchResults(prevResults => prevResults.filter(note => note.id !== noteId));
    } catch (err: any) {
      console.error('Failed to delete note:', err);
      setError(err.message || 'Failed to delete note');
      throw err;
    }
  };

  const getNoteById = async (noteId: number): Promise<Note> => {
    try {
      setError(null);
      
      // First, try to find the note in our local state
      const localNote = notes.find(note => note.id === noteId);
      if (localNote) {
        return localNote;
      }
      
      // If not found locally, fetch from server
      const note = await noteService.getNoteById(noteId);
      return note;
    } catch (err: any) {
      console.error('Failed to get note by ID:', err);
      setError(err.message || 'Failed to load note');
      throw err;
    }
  };

  const searchNotes = async (keyword: string): Promise<Note[]> => {
    try {
      setIsSearching(true);
      setError(null);
      setSearchKeyword(keyword);
      
      if (!keyword.trim()) {
        setSearchResults([]);
        return [];
      }
      
      const results = await noteService.searchNotes(keyword);
      setSearchResults(results);
      return results;
    } catch (err: any) {
      console.error('Failed to search notes:', err);
      setError(err.message || 'Failed to search notes');
      setSearchResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setSearchKeyword('');
    setIsSearching(false);
  };

  const clearError = () => {
    setError(null);
  };

  const value: NotesContextType = {
    notes,
    loading,
    error,
    notesCount,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    searchNotes,
    refreshNotes,
    clearError,
    searchResults,
    isSearching,
    searchKeyword,
    setSearchKeyword,
    clearSearch,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export default NotesContext;

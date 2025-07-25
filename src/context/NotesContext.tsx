import React, { createContext, useContext, useEffect, useState } from 'react';
import noteService from '../services/noteService';
import { CreateNoteRequest, Note, UpdateNoteRequest } from '../types/api';
import { useAuth } from './AuthContext';

interface NotesContextType {
  // Active notes state
  notes: Note[];
  notesLoading: boolean;
  notesError: string | null;
  notesCount: number;
  searchResults: Note[];
  isSearching: boolean;
  searchKeyword: string;
  
  // Trash state
  trashedNotes: Note[];
  trashLoading: boolean;
  trashError: string | null;
  trashedNotesCount: number;
  trashSearchResults: Note[];
  isSearchingTrash: boolean;
  trashSearchKeyword: string;

  // Active notes operations
  createNote: (noteData: CreateNoteRequest) => Promise<Note>;
  updateNote: (noteId: number, noteData: UpdateNoteRequest) => Promise<Note>;
  moveToTrash: (noteId: number) => Promise<void>;
  getNoteById: (noteId: number) => Promise<Note>;
  searchNotes: (keyword: string) => Promise<Note[]>;
  refreshNotes: () => Promise<void>;
  clearError: () => void;
  setSearchKeyword: (keyword: string) => void;
  clearSearch: () => void;

  // Trash operations
  fetchTrashedNotes: () => Promise<void>;
  restoreNote: (noteId: number) => Promise<void>;
  permanentlyDeleteNote: (noteId: number) => Promise<void>;
  emptyTrash: () => Promise<void>;
  searchTrashedNotes: (keyword: string) => Promise<Note[]>;
  clearTrashError: () => void;
  setTrashSearchKeyword: (keyword: string) => void;
  clearTrashSearch: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Active notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [notesCount, setNotesCount] = useState(0);
  
  // Active notes search state
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Trash state
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashError, setTrashError] = useState<string | null>(null);
  const [trashedNotesCount, setTrashedNotesCount] = useState(0);
  
  // Trash search state
  const [trashSearchResults, setTrashSearchResults] = useState<Note[]>([]);
  const [isSearchingTrash, setIsSearchingTrash] = useState(false);
  const [trashSearchKeyword, setTrashSearchKeyword] = useState('');
  
  const { isAuthenticated } = useAuth();

  // Load notes when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshNotes();
      loadNotesCount();
      loadTrashedNotesCount();
    } else {
      // Clear notes when user logs out
      setNotes([]);
      setNotesCount(0);
      setTrashedNotes([]);
      setTrashedNotesCount(0);
      clearSearch();
      clearTrashSearch();
    }
  }, [isAuthenticated]);

  const refreshNotes = async () => {
    if (!isAuthenticated) return;
    
    try {
      setNotesLoading(true);
      setNotesError(null);
      const userNotes = await noteService.getUserNotes();
      setNotes(userNotes);
    } catch (err: any) {
      console.error('Failed to refresh notes:', err);
      setNotesError(err.message || 'Failed to load notes');
    } finally {
      setNotesLoading(false);
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

  const loadTrashedNotesCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const count = await noteService.getTrashedNotesCount();
      setTrashedNotesCount(count);
    } catch (err: any) {
      console.error('Failed to load trashed notes count:', err);
    }
  };

  const createNote = async (noteData: CreateNoteRequest): Promise<Note> => {
    try {
      setNotesError(null);
      const newNote = await noteService.createNote(noteData);
      
      // Add the new note to the beginning of the list
      setNotes(prevNotes => [newNote, ...prevNotes]);
      setNotesCount(prevCount => prevCount + 1);
      
      return newNote;
    } catch (err: any) {
      console.error('Failed to create note:', err);
      setNotesError(err.message || 'Failed to create note');
      throw err;
    }
  };

  const updateNote = async (noteId: number, noteData: UpdateNoteRequest): Promise<Note> => {
    try {
      setNotesError(null);
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
      setNotesError(err.message || 'Failed to update note');
      throw err;
    }
  };

  const moveToTrash = async (noteId: number): Promise<void> => {
    try {
      setNotesError(null);
      await noteService.deleteNote(noteId); // Backend DELETE now does soft delete
      
      // Remove the note from active notes list
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      setNotesCount(prevCount => Math.max(0, prevCount - 1));
      
      // Remove from search results if present
      setSearchResults(prevResults => prevResults.filter(note => note.id !== noteId));
      
      // Update trash count
      setTrashedNotesCount(prevCount => prevCount + 1);
    } catch (err: any) {
      console.error('Failed to move note to trash:', err);
      setNotesError(err.message || 'Failed to move note to trash');
      throw err;
    }
  };

  const getNoteById = async (noteId: number): Promise<Note> => {
    try {
      setNotesError(null);
      
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
      setNotesError(err.message || 'Failed to load note');
      throw err;
    }
  };

  const searchNotes = async (keyword: string): Promise<Note[]> => {
    try {
      setIsSearching(true);
      setNotesError(null);
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
      setNotesError(err.message || 'Failed to search notes');
      setSearchResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Trash operations
  const fetchTrashedNotes = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      setTrashLoading(true);
      setTrashError(null);
      const trashed = await noteService.getTrashedNotes();
      setTrashedNotes(trashed);
    } catch (err: any) {
      console.error('Failed to fetch trashed notes:', err);
      setTrashError(err.message || 'Failed to load trashed notes');
    } finally {
      setTrashLoading(false);
    }
  };

  const restoreNote = async (noteId: number): Promise<void> => {
    try {
      setTrashError(null);
      await noteService.restoreNote(noteId);
      
      // Remove from trashed notes
      setTrashedNotes(prevTrash => prevTrash.filter(note => note.id !== noteId));
      setTrashedNotesCount(prevCount => Math.max(0, prevCount - 1));
      
      // Remove from trash search results if present
      setTrashSearchResults(prevResults => prevResults.filter(note => note.id !== noteId));
      
      // Update active notes count
      setNotesCount(prevCount => prevCount + 1);
      
      // Refresh active notes to include restored note
      await refreshNotes();
    } catch (err: any) {
      console.error('Failed to restore note:', err);
      setTrashError(err.message || 'Failed to restore note');
      throw err;
    }
  };

  const permanentlyDeleteNote = async (noteId: number): Promise<void> => {
    try {
      setTrashError(null);
      await noteService.permanentlyDeleteNote(noteId);
      
      // Remove from trashed notes
      setTrashedNotes(prevTrash => prevTrash.filter(note => note.id !== noteId));
      setTrashedNotesCount(prevCount => Math.max(0, prevCount - 1));
      
      // Remove from trash search results if present
      setTrashSearchResults(prevResults => prevResults.filter(note => note.id !== noteId));
    } catch (err: any) {
      console.error('Failed to permanently delete note:', err);
      setTrashError(err.message || 'Failed to permanently delete note');
      throw err;
    }
  };

  const emptyTrash = async (): Promise<void> => {
    try {
      setTrashError(null);
      await noteService.emptyTrash();
      
      // Clear all trashed notes
      setTrashedNotes([]);
      setTrashedNotesCount(0);
      setTrashSearchResults([]);
      setTrashSearchKeyword('');
    } catch (err: any) {
      console.error('Failed to empty trash:', err);
      setTrashError(err.message || 'Failed to empty trash');
      throw err;
    }
  };

  const searchTrashedNotes = async (keyword: string): Promise<Note[]> => {
    try {
      setTrashError(null);
      setIsSearchingTrash(true);
      setTrashSearchKeyword(keyword);
      
      if (!keyword.trim()) {
        setTrashSearchResults([]);
        return [];
      }
      
      const results = await noteService.searchTrashedNotes(keyword);
      setTrashSearchResults(results);
      return results;
    } catch (err: any) {
      console.error('Failed to search trashed notes:', err);
      setTrashError(err.message || 'Failed to search trashed notes');
      setTrashSearchResults([]);
      return [];
    } finally {
      setIsSearchingTrash(false);
    }
  };

  // Utility functions
  const clearSearch = () => {
    setSearchResults([]);
    setSearchKeyword('');
    setIsSearching(false);
  };

  const clearTrashSearch = () => {
    setTrashSearchResults([]);
    setTrashSearchKeyword('');
    setIsSearchingTrash(false);
  };

  const clearError = () => {
    setNotesError(null);
  };

  const clearTrashError = () => {
    setTrashError(null);
  };

  const setSearchKeywordFunction = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const setTrashSearchKeywordFunction = (keyword: string) => {
    setTrashSearchKeyword(keyword);
  };

  const value: NotesContextType = {
    // Active notes state
    notes,
    notesLoading,
    notesError,
    notesCount,
    searchResults,
    isSearching,
    searchKeyword,
    
    // Trash state
    trashedNotes,
    trashLoading,
    trashError,
    trashedNotesCount,
    trashSearchResults,
    isSearchingTrash,
    trashSearchKeyword,

    // Active notes operations
    createNote,
    updateNote,
    moveToTrash,
    getNoteById,
    searchNotes,
    refreshNotes,
    clearError,
    setSearchKeyword: setSearchKeywordFunction,
    clearSearch,

    // Trash operations
    fetchTrashedNotes,
    restoreNote,
    permanentlyDeleteNote,
    emptyTrash,
    searchTrashedNotes,
    clearTrashError,
    setTrashSearchKeyword: setTrashSearchKeywordFunction,
    clearTrashSearch,
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

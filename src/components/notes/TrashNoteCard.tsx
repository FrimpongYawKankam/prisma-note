import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../../types/api';
import { useNotes } from '../../context/NotesContext';

interface TrashNoteCardProps {
  note: Note;
  onRestore?: (noteId: number) => void;
  onPermanentDelete?: (noteId: number) => void;
}

export const TrashNoteCard: React.FC<TrashNoteCardProps> = ({ 
  note, 
  onRestore, 
  onPermanentDelete 
}) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { restoreNote, permanentlyDeleteNote } = useNotes();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleRestore = async () => {
    if (isRestoring || isDeleting) return;

    try {
      setIsRestoring(true);
      await restoreNote(note.id);
      onRestore?.(note.id);
    } catch (error) {
      console.error('Failed to restore note:', error);
      Alert.alert('Error', 'Failed to restore note. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = () => {
    if (isRestoring || isDeleting) return;

    Alert.alert(
      'Permanently Delete Note',
      'This action cannot be undone. Are you sure you want to permanently delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await permanentlyDeleteNote(note.id);
              onPermanentDelete?.(note.id);
            } catch (error) {
              console.error('Failed to permanently delete note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title || 'Untitled Note'}
        </Text>
        
        {note.content && (
          <Text style={styles.preview} numberOfLines={2}>
            {truncateText(note.content, 150)}
          </Text>
        )}
        
        <View style={styles.metadata}>
          <Text style={styles.date}>
            Deleted {formatDate(note.lastModified)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.restoreButton]}
          onPress={handleRestore}
          disabled={isRestoring || isDeleting}
        >
          <Ionicons 
            name={isRestoring ? "refresh" : "arrow-undo"} 
            size={20} 
            color="#007AFF" 
          />
          <Text style={styles.restoreText}>
            {isRestoring ? 'Restoring...' : 'Restore'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handlePermanentDelete}
          disabled={isRestoring || isDeleting}
        >
          <Ionicons 
            name={isDeleting ? "refresh" : "trash"} 
            size={20} 
            color="#FF3B30" 
          />
          <Text style={styles.deleteText}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    opacity: 0.8, // Slightly faded to indicate it's in trash
  },
  content: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  preview: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  restoreButton: {
    borderRightWidth: 1,
    borderRightColor: '#F2F2F7',
  },
  deleteButton: {},
  restoreText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  deleteText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default TrashNoteCard;

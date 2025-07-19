import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotes } from '../../context/NotesContext';
import { useTheme } from '../../context/ThemeContext';
import TrashNoteList from '../../components/notes/TrashNoteList';

export default function TrashScreen() {
  const { colors } = useTheme();
  const {
    trashSearchKeyword,
    searchTrashedNotes,
    clearTrashSearch,
    setTrashSearchKeyword,
  } = useNotes();

  const [localSearchKeyword, setLocalSearchKeyword] = useState(trashSearchKeyword);

  const handleSearch = async (keyword: string) => {
    setLocalSearchKeyword(keyword);
    setTrashSearchKeyword(keyword);
    
    if (keyword.trim()) {
      await searchTrashedNotes(keyword);
    } else {
      clearTrashSearch();
    }
  };

  const handleClearSearch = () => {
    setLocalSearchKeyword('');
    clearTrashSearch();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 4,
    },
    clearButton: {
      padding: 4,
      marginLeft: 8,
    },
    listContainer: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colors.textSecondary} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trashed notes..."
            placeholderTextColor={colors.textSecondary}
            value={localSearchKeyword}
            onChangeText={handleSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {localSearchKeyword && localSearchKeyword.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSearch}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Trash Notes List */}
      <View style={styles.listContainer}>
        <TrashNoteList searchKeyword={localSearchKeyword} />
      </View>
    </SafeAreaView>
  );
}

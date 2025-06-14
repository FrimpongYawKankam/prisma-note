import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isToday, isYesterday, parseISO } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  Swipeable,
} from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [menuVisible, setMenuVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [notes, setNotes] = useState([]);
  const [deletedNote, setDeletedNote] = useState(null);
  const undoTimerRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const user = await AsyncStorage.getItem('user');
        const savedNotes = await AsyncStorage.getItem('notes');
        if (user) setUserData(JSON.parse(user));
        if (savedNotes) setNotes(JSON.parse(savedNotes));
      };
      loadData();
    }, [])
  );

  const saveNotes = async (updatedNotes) => {
    setNotes(updatedNotes);
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    if (noteTitle.trim() === '' || noteContent.trim() === '') return;
    const timestamp = new Date().toISOString();

    if (editingIndex !== null) {
      const updated = [...notes];
      updated[editingIndex] = {
        ...updated[editingIndex],
        title: noteTitle,
        content: noteContent,
        createdAt: timestamp,
      };
      saveNotes(updated);
      setEditingIndex(null);
    } else {
      const newNote = {
        title: noteTitle,
        content: noteContent,
        createdAt: timestamp,
      };
      saveNotes([newNote, ...notes]);
    }

    setNoteTitle('');
    setNoteContent('');
    Keyboard.dismiss();
  };

  const handleEditNote = (index) => {
    const note = notes[index];
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setEditingIndex(index);
  };

  const handleDeleteNote = (index) => {
    const noteToDelete = notes[index];
    const updated = notes.filter((_, i) => i !== index);
    setDeletedNote({ note: noteToDelete, index });
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      saveNotes(updated);
      undoTimerRef.current = setTimeout(() => {
        setDeletedNote(null);
      }, 5000);
    });
  };

  const handleUndo = () => {
    if (deletedNote) {
      const updated = [...notes];
      updated.splice(deletedNote.index, 0, deletedNote.note);
      saveNotes(updated);
      setDeletedNote(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert('Logged Out', 'You have been logged out.');
    router.push('/login');
  };

  const groupNotes = () => {
    const filtered = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const today = [];
    const yesterday = [];
    const week = [];

    filtered.forEach((note) => {
      const date = parseISO(note.createdAt);
      if (isToday(date)) today.push(note);
      else if (isYesterday(date)) yesterday.push(note);
      else week.push(note);
    });

    const sections = [];
    if (today.length) sections.push({ title: 'Today', data: today });
    if (yesterday.length) sections.push({ title: 'Yesterday', data: yesterday });
    if (week.length) sections.push({ title: 'This Week', data: week });
    return sections;
  };

  const renderRightActions = (index) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDeleteNote(index)}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>
              Hello, <Text style={styles.highlight}>{userData.username || 'User'}</Text>
            </Text>
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subText}>Think it. Make it.</Text>

          {menuVisible && (
            <View style={styles.menu}>
              <TouchableOpacity onPress={() => Alert.alert('Profile', `Username: ${userData.username}\nEmail: ${userData.email}`)}>
                <Text style={styles.menuItem}>👤 Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMenuVisible(false); router.push('/settings'); }}>
                <Text style={styles.menuItem}>⚙️ Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('About', 'This is a Notion-style note app.')}>
                <Text style={styles.menuItem}>ℹ️ About</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Help', 'Need help? Contact support@example.com')}>
                <Text style={styles.menuItem}>❓ Help</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.menuItem}>🚪 Log Out</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              placeholder=" Search notes "
              placeholderTextColor="#888"
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Note Title"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={noteTitle}
              onChangeText={setNoteTitle}
            />
            <TextInput
              placeholder="Write a note..."
              placeholderTextColor="#aaa"
              style={[styles.input, { marginTop: 8 }]}
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
              <Ionicons
                name={editingIndex !== null ? 'create-outline' : 'add'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <SectionList
            sections={groupNotes()}
            keyExtractor={(item, index) => `${item.createdAt}-${index}`}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            renderItem={({ item }) => {
              const actualIndex = notes.findIndex((n) => n.createdAt === item.createdAt);
              return (
                <Swipeable renderRightActions={() => renderRightActions(actualIndex)}>
                  <Animated.View style={[styles.noteItem, { opacity: fadeAnim }]}>
                    <Text style={styles.noteTitle}>{item.title}</Text>
                    <Text style={styles.noteText}>
                      {item.content.length > 60 ? item.content.slice(0, 60) + '...' : item.content}
                    </Text>
                    <Text style={styles.timestamp}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                    <View style={styles.noteActions}>
                      <TouchableOpacity onPress={() => handleEditNote(actualIndex)}>
                        <Ionicons name="create-outline" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </Swipeable>
              );
            }}
            contentContainerStyle={{ paddingBottom: 60 }}
          />

          {deletedNote && (
            <View style={styles.undoBar}>
              <Text style={styles.undoText}>Note deleted</Text>
              <TouchableOpacity onPress={handleUndo}>
                <Text style={styles.undoButton}>UNDO</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 26, fontWeight: '700' },
  highlight: { color: '#64ffda' },
  subText: { color: '#aaa', fontSize: 16, marginBottom: 10 },
  searchBar: { flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  searchInput: { marginLeft: 10, color: '#fff', flex: 1 },
  menu: { position: 'absolute', top: 60, right: 20, backgroundColor: '#1a1a1a', padding: 10, borderRadius: 6, zIndex: 10 },
  menuItem: { color: '#fff', paddingVertical: 6 },
  inputContainer: { borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 10, marginBottom: 20 },
  input: { color: '#fff', height: 40 },
  addButton: { marginTop: 10, alignSelf: 'flex-end', padding: 8, backgroundColor: '#222', borderRadius: 6 },
  sectionHeader: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  noteItem: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 15, marginBottom: 10 },
  noteTitle: { color: '#64ffda', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  noteText: { color: '#00ffcc', fontSize: 14 },
  timestamp: { color: '#888', fontSize: 12, marginTop: 6 },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 16 },
  deleteButton: { backgroundColor: '#ff4c4c', justifyContent: 'center', alignItems: 'center', width: 80, borderRadius: 8, marginBottom: 10 },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginTop: 4 },
  undoBar: { position: 'absolute', bottom: 10, left: 20, right: 20, backgroundColor: '#333', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' },
  undoText: { color: '#fff' },
  undoButton: { color: '#64ffda', fontWeight: 'bold' },
});

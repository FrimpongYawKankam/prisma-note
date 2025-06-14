import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isToday, isYesterday, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [menuVisible, setMenuVisible] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const user = await AsyncStorage.getItem('user');
      const savedNotes = await AsyncStorage.getItem('notes');
      if (user) setUserData(JSON.parse(user));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
    };
    loadData();
  }, []);

  const saveNotes = async (updatedNotes) => {
    setNotes(updatedNotes);
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    if (noteInput.trim() === '') return;

    const timestamp = new Date().toISOString();
    if (editingIndex !== null) {
      const updated = [...notes];
      updated[editingIndex] = { ...updated[editingIndex], text: noteInput, createdAt: timestamp };
      saveNotes(updated);
      setEditingIndex(null);
    } else {
      saveNotes([...notes, { text: noteInput, createdAt: timestamp }]);
    }

    setNoteInput('');
    Keyboard.dismiss();
  };

  const handleEditNote = (index) => {
    setNoteInput(notes[index].text);
    setEditingIndex(index);
  };

  const handleDeleteNote = (index) => {
    const updated = notes.filter((_, i) => i !== index);
    saveNotes(updated);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert('Logged Out', 'You have been logged out.');
    router.push('/login');
  };

  const groupNotes = () => {
    const today = [];
    const yesterday = [];
    const week = [];

    notes.forEach((note) => {
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

  return (
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
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Profile', `Username: ${userData.username}\nEmail: ${userData.email}`)
              }
            >
              <Text style={styles.menuItem}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                router.push('/settings');
              }}
            >
              <Text style={styles.menuItem}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.menuItem}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Search or ask AI"
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Write a note..."
            placeholderTextColor="#aaa"
            style={styles.input}
            value={noteInput}
            onChangeText={setNoteInput}
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
          keyExtractor={(item, index) => item.createdAt + index}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item, index }) => (
            <View style={styles.noteItem}>
              <Text style={styles.noteText}>{item.text}</Text>
              <View style={styles.noteActions}>
                <TouchableOpacity onPress={() => handleEditNote(index)}>
                  <Ionicons name="create-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteNote(index)}>
                  <Ionicons name="trash-outline" size={20} color="#ff4c4c" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  highlight: {
    color: '#64ffda',
  },
  subText: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    marginLeft: 10,
    color: '#fff',
    flex: 1,
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 6,
    zIndex: 10,
  },
  menuItem: {
    color: '#fff',
    paddingVertical: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: '#fff',
    height: 40,
  },
  addButton: {
    padding: 8,
    backgroundColor: '#222',
    borderRadius: 6,
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  noteItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  noteText: {
    color: '#fff',
    fontSize: 16,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 16,
  },
});

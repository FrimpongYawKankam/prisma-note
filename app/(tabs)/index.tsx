import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [menuVisible, setMenuVisible] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const user = await AsyncStorage.getItem('user');
      const savedNotes = await AsyncStorage.getItem('notes');
      if (user) {
        setUserData(JSON.parse(user));
      }
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    };
    loadData();
  }, []);

  const saveNotes = async (updatedNotes) => {
    setNotes(updatedNotes);
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    if (noteInput.trim() === '') return;
    if (editingIndex !== null) {
      const updated = [...notes];
      updated[editingIndex] = noteInput;
      saveNotes(updated);
      setEditingIndex(null);
    } else {
      saveNotes([...notes, noteInput]);
    }
    setNoteInput('');
  };

  const handleEditNote = (index) => {
    setNoteInput(notes[index]);
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

  return (
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
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.menuItem}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Write a note..."
          placeholderTextColor="#888"
          style={styles.input}
          value={noteInput}
          onChangeText={setNoteInput}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
          <Ionicons name={editingIndex !== null ? 'create-outline' : 'add'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={({ item, index }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>{item}</Text>
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
      />
    </SafeAreaView>
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
    fontSize: 28,
    fontWeight: '700',
  },
  highlight: {
    color: '#64ffda',
  },
  subText: {
    color: '#888',
    fontSize: 18,
    marginBottom: 20,
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
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


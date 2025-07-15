import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Markdown from 'react-native-markdown-display';
import { Menu, Provider } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated, user, refreshUserData } = useAuth();
  const isDark = theme === 'dark';

  const [userData, setUserData] = useState({ fullName: '', email: '' });
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isAuthenticated) await refreshUserData();
        const userString = await AsyncStorage.getItem('user');
        const savedNotesString = await AsyncStorage.getItem('notes');

        if (user) {
          setUserData({ fullName: user.fullName || '', email: user.email });
        } else if (userString) {
          const storedUser = JSON.parse(userString);
          setUserData({ fullName: storedUser.fullName || '', email: storedUser.email });
        }

        if (savedNotesString) {
          setNotes(JSON.parse(savedNotesString));
        } else {
          await AsyncStorage.setItem('notes', JSON.stringify([]));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setNotes([]);
      }
    };
    loadData();
  }, []);

  const saveNotes = async (newNotes) => {
    setNotes(newNotes);
    await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
  };

  const handleAddNote = () => {
    if (noteInput.trim() === '') return;
    const newNote = {
      id: generateId(),
      title: noteInput,
      content: '# New Note\nStart writing...',
      createdAt: new Date().toISOString(),
      parentId: null,
    };
    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setNoteInput('');
    Keyboard.dismiss();
  };

  const handleEditNote = (note) => {
    router.push({ pathname: '/note-detail', params: { id: note.id } });
  };

  return (
    <Provider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerText, { color: isDark ? '#fff' : '#000' }]}>📝 <Text style={{ color: isDark ? '#64ffda' : '#00796B' }}>PrismaNote</Text></Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={<TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <Ionicons name="ellipsis-vertical" size={24} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>}
              >
                <Menu.Item onPress={() => { setMenuVisible(false); router.push('/profile'); }} title="Profile" />
                <Menu.Item onPress={() => { setMenuVisible(false); router.push('/help'); }} title="Help" />
                <Menu.Item onPress={() => { setMenuVisible(false); router.push('/settings'); }} title="Settings" />
                <Menu.Item onPress={() => { setMenuVisible(false); router.push('/about'); }} title="About" />
                <Menu.Item onPress={async () => { setMenuVisible(false); await AsyncStorage.removeItem('user'); router.replace('/login'); }} title="Log Out" />
              </Menu>
            </View>

            <Text style={[styles.subText, { color: isDark ? '#aaa' : '#444' }]}>Welcome back, {user?.fullName || userData.fullName || 'User'}!</Text>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#111' : '#eee' }]}>
              <TextInput
                placeholder="Write a note..."
                placeholderTextColor={isDark ? '#aaa' : '#888'}
                style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
                value={noteInput}
                onChangeText={setNoteInput}
              />
              <TouchableOpacity style={[styles.addButton, { backgroundColor: isDark ? '#222' : '#ccc' }]} onPress={handleAddNote}>
                <Ionicons name="add" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <View style={{ height: 1, backgroundColor: isDark ? '#333' : '#ddd', marginVertical: 10 }} />

            <DraggableFlatList
              data={notes}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => saveNotes(data)}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item, drag }) => (
                <TouchableOpacity
                  onLongPress={drag}
                  onPress={() => handleEditNote(item)}
                  style={[styles.noteItem, {
                    backgroundColor: isDark ? '#1a1a1a' : '#f4f4f4',
                    borderColor: isDark ? '#2a2a2a' : '#ccc'
                  }]}
                >
                  <Text style={[styles.noteText, { color: isDark ? '#00ffcc' : '#00796B' }]}>{item.title}</Text>
                  <Text style={[styles.noteTimestamp, { color: isDark ? '#888' : '#666' }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  <Markdown style={{ body: { color: isDark ? '#ddd' : '#333', fontSize: 14 } }}>
                    {item.content.slice(0, 100) + '...'}
                  </Markdown>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontSize: 26, fontWeight: '700' },
  subText: { fontSize: 16, marginBottom: 10 },
  inputContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: { flex: 1, height: 40, fontSize: 16, paddingVertical: 5 },
  addButton: { padding: 8, borderRadius: 6 },
  noteItem: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  noteText: { fontSize: 16, marginBottom: 4 },
  noteTimestamp: { fontSize: 12, marginBottom: 4 },
});

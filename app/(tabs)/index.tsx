import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Menu, Provider } from 'react-native-paper';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [userData, setUserData] = useState({ username: '', email: '' });
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [parentId, setParentId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const user = await AsyncStorage.getItem('user');
      const savedNotes = await AsyncStorage.getItem('notes');
      if (user) setUserData(JSON.parse(user));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
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
      content: '',
      createdAt: new Date().toISOString(),
      children: [],
      parentId: parentId || null,
    };
    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    setNoteInput('');
    setParentId(null);
    Keyboard.dismiss();
  };

  const handleDeleteNote = (id) => {
    const deleteRecursive = (list, noteId) =>
      list.filter((note) => note.id !== noteId && (!note.parentId || note.parentId !== noteId));
    const updatedNotes = deleteRecursive(notes, id);
    saveNotes(updatedNotes);
  };

  const handleEditNote = (note) => {
    router.push({ pathname: '/note-detail', params: { id: note.id } });
  };

  const toggleExpand = (id) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  };

  const buildTree = (list, parent = null) =>
    list.filter((item) => item.parentId === parent).map((item) => ({
      ...item,
      children: buildTree(list, item.id),
    }));

  const renderNested = (nodes, level = 0) =>
    nodes.map((node) => {
      const isExpanded = expandedNodes[node.id];

      const rightActions = () => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteNote(node.id)}>
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      );

      return (
        <View
          key={node.id}
          style={{
            marginLeft: level * 20,
            borderLeftWidth: level > 0 ? 1 : 0,
            borderLeftColor: isDark ? '#444' : '#ccc',
            paddingLeft: 8,
          }}
        >
          <Swipeable renderRightActions={rightActions}>
            <View style={styles.noteRow}>
              <TouchableOpacity onPress={() => toggleExpand(node.id)} style={styles.expandIconContainer}>
                <Ionicons
                  name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                  size={16}
                  color={isDark ? '#aaa' : '#555'}
                  style={{ marginRight: 6 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.noteItem,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#f4f4f4',
                    borderColor: isDark ? '#2a2a2a' : '#ccc',
                  },
                ]}
                onPress={() => handleEditNote(node)}
              >
                <Text style={[styles.noteText, { color: isDark ? '#00ffcc' : '#00796B' }]}>{node.title}</Text>
                <Text style={[styles.noteTimestamp, { color: isDark ? '#888' : '#666' }]}>
                  {new Date(node.createdAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setParentId(node.id)}>
                <Ionicons name="add-circle-outline" size={20} color={isDark ? '#64ffda' : '#00796B'} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </Swipeable>
          {isExpanded && renderNested(node.children, level + 1)}
        </View>
      );
    });

  const flatNotes = buildTree(notes);

  return (
    <Provider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerText, { color: isDark ? '#fff' : '#000' }]}>
                📝 <Text style={[styles.highlight, { color: isDark ? '#64ffda' : '#00796B' }]}>PrismaNote</Text>
              </Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Ionicons name="ellipsis-vertical" size={24} color={isDark ? '#fff' : '#000'} />
                  </TouchableOpacity>
                }
              >
                <Menu.Item onPress={() => { setMenuVisible(false); router.push('/profile'); }} title="Profile" />
                <Menu.Item onPress={() => { setMenuVisible(false); router.push('/help'); }} title="Help" />
                <Menu.Item onPress={() => { setMenuVisible(false); router.push('/settings'); }} title="Settings" />
                <Menu.Item onPress={() => { setMenuVisible(false); router.push('/about'); }} title="About" />
                <Menu.Item onPress={() => { setMenuVisible(false); handleLogout(); }} title="Log Out" />
              </Menu>
            </View>

            <Text style={[styles.subText, { color: isDark ? '#aaa' : '#444' }]}>
              Welcome back, {userData.username || 'User'}!
            </Text>

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

            {notes.length === 0 ? (
              <Text style={[styles.emptyText, { color: isDark ? '#666' : '#888' }]}>
                Start by creating your first note!
              </Text>
            ) : (
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                {renderNested(flatNotes)}
              </ScrollView>
            )}
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
  highlight: { fontWeight: '700' },
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
  noteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  expandIconContainer: { padding: 5 },
  noteItem: {
    borderRadius: 8,
    padding: 10,
    flex: 1,
    borderWidth: 1,
  },
  noteText: { fontSize: 16 },
  noteTimestamp: { fontSize: 12, marginTop: 4 },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
});


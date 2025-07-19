import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/context/ThemeContext'; // adjust path as needed

const TrashScreen = () => {
  const { theme } = useTheme(); // theme is either 'light' or 'dark'

  const backgroundColor = theme === 'dark' ? '#1a1a1a' : '#fff';
  const textColor = theme === 'dark' ? '#eee' : '#333';
  const subTextColor = theme === 'dark' ? '#aaa' : '#666';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.heading, { color: textColor }]}>
        🗑️ Trash
      </Text>

      <ScrollView>
        <View style={styles.note}>
          <Text style={[styles.title, { color: textColor }]}>📝 Grocery List</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>Deleted on: July 17, 2025</Text>
          <View style={styles.actions}>
            <TouchableOpacity>
              <Text style={[styles.actionText, { color: '#4CAF50' }]}>Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.actionText, { color: '#f44336' }]}>Delete Forever</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.note}>
          <Text style={[styles.title, { color: textColor }]}>📝 Lecture Notes - Linear Algebra</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>Deleted on: July 10, 2025</Text>
          <View style={styles.actions}>
            <TouchableOpacity>
              <Text style={[styles.actionText, { color: '#4CAF50' }]}>Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.actionText, { color: '#f44336' }]}>Delete Forever</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.emptyTrashBtn}>
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.emptyTrashText}>Empty Trash</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TrashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  note: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#2c2c2c22',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTrashBtn: {
    backgroundColor: '#d11a2a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 10,
  },
  emptyTrashText: {
    color: '#fff',
    fontWeight: '600',
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function InboxScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Inbox Screen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});
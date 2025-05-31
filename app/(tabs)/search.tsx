import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Search() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Search Screen</Text>
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
    color: '#FFFFFF', // White text for visibility
    fontSize: 18,
  },
});
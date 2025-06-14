import { StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About PrismaNotes</Text>
      <Text style={styles.text}>
        PrismaNotes is a lightweight, minimal Notion-style note-taking app built with Expo and React Native.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { fontSize: 24, color: '#64ffda', marginBottom: 12, fontWeight: 'bold' },
  text: { fontSize: 16, color: '#ccc' },
});

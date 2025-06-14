import { StyleSheet, Text, View } from 'react-native';

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help & FAQs</Text>
      <Text style={styles.text}>
        • To create a note, tap the "+" icon.{"\n"}
        • Swipe left on a note to delete it.{"\n"}
        • Tap the pencil icon to edit a note.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { fontSize: 24, color: '#64ffda', marginBottom: 12, fontWeight: 'bold' },
  text: { fontSize: 16, color: '#ccc', lineHeight: 24 },
});

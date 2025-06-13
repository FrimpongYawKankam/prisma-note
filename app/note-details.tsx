import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NoteDetails() {
  const { title } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>This is a detailed view of your note.</Text>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24 },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 10 },
  content: { fontSize: 16, color: '#ccc' },
  backButton: { marginTop: 30, padding: 12 },
  backText: { color: '#00f', fontSize: 16 },
});

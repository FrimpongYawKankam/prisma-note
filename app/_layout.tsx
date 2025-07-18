// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { NotesProvider } from '../src/context/NotesContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <NotesProvider>
            {/* This is where the app's main content will be rendered */}
            <Slot />
          </NotesProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

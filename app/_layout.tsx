// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { NotesProvider } from '../src/context/NotesContext';
import { EventsProvider } from '../src/context/EventsContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <NotesProvider>
            <EventsProvider>
              {/* This is where the app's main content will be rendered */}
              <Slot />
            </EventsProvider>
          </NotesProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

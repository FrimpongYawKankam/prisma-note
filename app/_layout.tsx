// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { EventsProvider } from '../src/context/EventsContext';
import { NotesProvider } from '../src/context/NotesContext';
import { TasksProvider } from '../src/context/TasksContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <NotesProvider>
            <EventsProvider>
              <TasksProvider>
                {/* This is where the app's main content will be rendered */}
                <Slot />
              </TasksProvider>
            </EventsProvider>
          </NotesProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

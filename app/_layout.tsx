// app/_layout.tsx
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { EventsProvider } from '../src/context/EventsContext';
import { NotesProvider } from '../src/context/NotesContext';
import { TasksProvider } from '../src/context/TasksContext';
import { TaskStatsProvider } from '../src/context/TaskStatsContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { removeNotificationListeners, requestNotificationPermissions, setupNotificationListeners } from '../src/services/notificationService';

function AppContent() {
  const { theme } = useTheme();
  
  // Initialize notifications on app start
  useEffect(() => {
    let notificationListeners: any = null;

    const initializeNotifications = async () => {
      try {
        console.log('🔔 Initializing notifications...');
        const hasPermission = await requestNotificationPermissions();
        
        if (hasPermission) {
          notificationListeners = setupNotificationListeners();
          console.log('✅ Notifications initialized successfully');
        } else {
          console.warn('⚠️ Notification permissions not granted');
        }
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    // Cleanup listeners on unmount
    return () => {
      if (notificationListeners) {
        removeNotificationListeners(notificationListeners);
      }
    };
  }, []);
  
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <AuthProvider>
        <TaskStatsProvider>
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
        </TaskStatsProvider>
      </AuthProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

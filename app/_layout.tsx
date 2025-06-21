// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

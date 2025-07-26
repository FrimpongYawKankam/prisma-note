// Finance Layout - Navigation configuration for finance screens

import { Stack } from 'expo-router';

export default function FinanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Configure left-to-right slide animation when leaving screens
        animation: 'slide_from_left',
        // Enable gesture to dismiss screens with left-to-right swipe
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        // Configure how the screen animates when being replaced
        animationTypeForReplace: 'pop',
      }}
    >
      <Stack.Screen 
        name="create-budget" 
        options={{
          animation: 'slide_from_left',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen 
        name="add-expense" 
        options={{
          animation: 'slide_from_left',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen 
        name="expenses" 
        options={{
          animation: 'slide_from_left',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen 
        name="analytics" 
        options={{
          animation: 'slide_from_left',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen 
        name="edit-budget" 
        options={{
          animation: 'slide_from_left',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Stack>
  );
}

// Finance Layout - Navigation configuration for finance screens

import { Stack } from 'expo-router';

export default function FinanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="create-budget" />
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="expenses" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}

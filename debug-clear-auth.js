// 🔧 Debug Script: Clear Authentication Data
// This script helps clear stale authentication tokens when the app crashes

const { exec } = require('child_process');

console.log('🔧 Debug: Clearing React Native AsyncStorage...');
console.log('This will remove all stored authentication data.');

// For React Native debugging - clear AsyncStorage via adb (Android)
const clearAndroidStorage = () => {
  exec('adb shell pm clear host.exp.exponent', (error, stdout, stderr) => {
    if (error) {
      console.log('📱 Android: Could not clear via adb (device might not be connected)');
    } else {
      console.log('✅ Android: Expo Go storage cleared');
    }
  });
};

// Instructions for manual clearing
console.log('\n📋 Manual Steps to Clear Authentication:');
console.log('1. Close the Expo app completely');
console.log('2. On your device/simulator:');
console.log('   📱 Android: Clear Expo Go app data in settings');
console.log('   🍎 iOS: Delete and reinstall Expo Go app');
console.log('3. Restart Expo development server');
console.log('4. Reload the app');

console.log('\n🔄 Attempting automatic clear for Android...');
clearAndroidStorage();

console.log('\n💡 Alternative: Add this code to your app temporarily:');
console.log(`
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this to a button press or component mount
const clearAuth = async () => {
  await AsyncStorage.multiRemove(['jwt_token', 'refresh_token', 'user']);
  console.log('🔓 Authentication data cleared');
};
`);

setTimeout(() => {
  console.log('\n✅ Debug script completed');
  process.exit(0);
}, 2000);

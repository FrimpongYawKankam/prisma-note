import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/context/AuthContext";
import SplashScreen from "./splash";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 6 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#64ffda" />
      </View>
    );
  }

  // Redirect based on auth status
  return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}
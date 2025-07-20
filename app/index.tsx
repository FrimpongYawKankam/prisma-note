import { Redirect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated } from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import SplashScreen from "./splash";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  const [showSplash, setShowSplash] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animation values for smooth transition
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const redirectFadeAnim = useRef(new Animated.Value(0)).current;
  const redirectSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Show splash screen for 6 seconds
    const timer = setTimeout(() => {
      startTransition();
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const startTransition = () => {
    setIsTransitioning(true);
    
    // Start exit animation for splash screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animation completes, hide splash and show main app
      setShowSplash(false);
      setIsTransitioning(false);
      
      // Start entrance animation for main app
      Animated.parallel([
        Animated.timing(redirectFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(redirectSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Show splash screen with exit animation
  if (showSplash || isTransitioning) {
    return (
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <SplashScreen />
      </Animated.View>
    );
  }

  if (loading) {
    return (
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDark ? '#000000' : '#f5f5f5',
          opacity: redirectFadeAnim,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </Animated.View>
    );
  }

  // Redirect based on auth status with smooth transition
  const targetRoute = isAuthenticated ? "/(tabs)" : "/login";
  
  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#f5f5f5',
        opacity: redirectFadeAnim,
        transform: [{ translateY: redirectSlideAnim }],
      }}
    >
      <Redirect href={targetRoute} />
    </Animated.View>
  );
}
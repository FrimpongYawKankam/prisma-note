import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useTheme } from '../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { colors } = useTheme();
  const [dotCount, setDotCount] = useState(0);
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const backgroundGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations sequence
    startAnimations();
    
    // Dot animation timer
    const dotTimer = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 400);

    return () => {
      clearInterval(dotTimer);
    };
  }, []);

  const startAnimations = () => {
    // Background subtle glow
    Animated.timing(backgroundGlow, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Logo zoom-in and fade-in animation with spring effect
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1.0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow animation with pulsing effect
    Animated.sequence([
      Animated.delay(600),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Loading text fade-in
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderLoadingDots = () => {
    return '.'.repeat(dotCount);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.container}>
        {/* Background gradient effect */}
        <Animated.View
          style={[
            styles.backgroundGlow,
            {
              opacity: backgroundGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.1],
              }),
            },
          ]}
        />
        
        <View style={styles.content}>
          {/* Logo with glow effect */}
          <View style={styles.logoContainer}>
            {/* Multiple glow layers for depth */}
            <Animated.View
              style={[
                styles.glowEffect,
                styles.outerGlow,
                {
                  opacity: glowOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.6],
                  }),
                  shadowColor: colors.primary,
                },
              ]}
            />
            
            <Animated.View
              style={[
                styles.glowEffect,
                styles.innerGlow,
                {
                  opacity: glowOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.8],
                  }),
                  shadowColor: '#ffffff',
                },
              ]}
            />
            
            {/* Main logo */}
            <Animated.Image
              source={require('../assets/images/logo.jpeg')}
              style={[
                styles.logo,
                {
                  transform: [{ scale: logoScale }],
                  opacity: logoOpacity,
                },
              ]}
              resizeMode="cover"
            />
          </View>

          {/* Loading section */}
          <Animated.View
            style={[
              styles.loadingContainer,
              { opacity: loadingOpacity },
            ]}
          >
            <Text style={[styles.loadingText, { color: colors.primary }]}>
              Loading
            </Text>
            <Text style={[styles.dotsText, { color: colors.primary }]}>
              {renderLoadingDots()}
            </Text>
          </Animated.View>

          {/* App tagline */}
          <Animated.View
            style={[
              styles.taglineContainer,
              { opacity: loadingOpacity },
            ]}
          >
            <Text style={styles.tagline}>
              Your Digital Note Companion
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: 150,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    elevation: 10,
  },
  outerGlow: {
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    shadowRadius: 50,
  },
  innerGlow: {
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    shadowRadius: 25,
  },
  logo: {
    width: 220,
    height: 220,
    borderRadius: 110, // Half of width/height to make it perfectly circular
    overflow: 'hidden', // Ensures the image is clipped to the circular shape
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  dotsText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 6,
    minWidth: 30,
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    fontWeight: '300',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

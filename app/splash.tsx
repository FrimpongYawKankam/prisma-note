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
  const [dotCount, setDotCount] = useState(3); // Start with 3 dots for countdown
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const backgroundGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations sequence
    startAnimations();
    
    // Countdown timer - starts at 3 and counts down every 2 seconds
    let currentCount = 3;
    const countdownTimer = setInterval(() => {
      currentCount -= 1;
      setDotCount(currentCount);
      
      if (currentCount <= 0) {
        clearInterval(countdownTimer);
      }
    }, 2000); // 2 seconds per countdown step (6 seconds total)

    return () => {
      clearInterval(countdownTimer);
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

  const renderCountdownDots = () => {
    return Array.from({ length: 3 }, (_, index) => (
      <View
        key={index}
        style={[
          styles.countdownDot,
          {
            backgroundColor: index < dotCount ? colors.primary : '#333',
          },
        ]}
      />
    ));
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            {/* Main logo */}
            <Animated.Image
              source={require('../assets/images/finallogo.png')}
              style={[
                styles.logo,
                {
                  transform: [{ scale: logoScale }],
                  opacity: logoOpacity,
                },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* Countdown dots section */}
          <Animated.View
            style={[
              styles.countdownContainer,
              { opacity: loadingOpacity },
            ]}
          >
            {renderCountdownDots()}
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
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 280,
    height: 120,
    // Removed borderRadius and overflow to show full logo with text
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    gap: 15,
  },
  countdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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

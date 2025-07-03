import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface MessageBoxProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  duration?: number; // in milliseconds
}

const MessageBox: React.FC<MessageBoxProps> = ({ 
  message, 
  type = 'error', 
  duration = 3000 
}) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  useEffect(() => {
    // Only run effect if message changes and isn't empty
    if (!message) return;

    // Delay the state update to avoid React insertion phase conflicts
    const showMessage = () => {
      setVisible(true);
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    // Use requestAnimationFrame to schedule after render is complete
    const animationId = requestAnimationFrame(showMessage);
    
    // After duration, fade out
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Delay the state update slightly
        requestAnimationFrame(() => {
          setVisible(false);
        });
      });
    }, duration);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationId);
    };
  }, [message, duration, fadeAnim]);

  if (!message || !visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        type === 'error' && styles.error,
        type === 'success' && styles.success,
        type === 'info' && styles.info,
        { opacity: fadeAnim }
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  error: {
    backgroundColor: '#ff4d4f',
  },
  success: {
    backgroundColor: '#52c41a',
  },
  info: {
    backgroundColor: '#1890ff',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MessageBox;

/**
 * Smooth transition configurations for the entire app
 * Provides consistent sliding animations between screens
 */

// Default timing configuration for smooth transitions
const defaultTimingConfig = {
  animation: 'timing' as const,
  config: {
    duration: 300,
    useNativeDriver: true,
  },
};

// Spring-based transition for more natural feel
const springConfig = {
  animation: 'spring' as const,
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
    useNativeDriver: true,
  },
};

// Fade transition for gentle screen changes
export const fadeTransition = {
  transitionSpec: {
    open: defaultTimingConfig,
    close: defaultTimingConfig,
  },
  cardStyleInterpolator: ({ current }: any) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
};

// Slide from right transition (default for forward navigation)
export const slideFromRightTransition = {
  transitionSpec: {
    open: defaultTimingConfig,
    close: defaultTimingConfig,
  },
  cardStyleInterpolator: ({ current, layouts }: any) => {
    const translateX = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.width, 0],
    });

    return {
      cardStyle: {
        transform: [{ translateX }],
      },
    };
  },
};

// Slide from left transition (for back navigation)
export const slideFromLeftTransition = {
  transitionSpec: {
    open: defaultTimingConfig,
    close: defaultTimingConfig,
  },
  cardStyleInterpolator: ({ current, layouts }: any) => {
    const translateX = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-layouts.screen.width, 0],
    });

    return {
      cardStyle: {
        transform: [{ translateX }],
      },
    };
  },
};

// Slide up transition (for modals and special screens)
export const slideUpTransition = {
  transitionSpec: {
    open: springConfig,
    close: defaultTimingConfig,
  },
  cardStyleInterpolator: ({ current, layouts }: any) => {
    const translateY = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.height, 0],
    });

    const opacity = current.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
    });

    return {
      cardStyle: {
        transform: [{ translateY }],
        opacity,
      },
    };
  },
};

// Scale transition for splash to main app
export const scaleTransition = {
  transitionSpec: {
    open: springConfig,
    close: defaultTimingConfig,
  },
  cardStyleInterpolator: ({ current }: any) => {
    const scale = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const opacity = current.progress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.5, 1],
    });

    return {
      cardStyle: {
        transform: [{ scale }],
        opacity,
      },
    };
  },
};

// Combined transition for splash screen exit
export const splashExitTransition = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 500,
        useNativeDriver: true,
      },
    },
    close: defaultTimingConfig,
  },
  cardStyleInterpolator: ({ current, layouts }: any) => {
    // Slide up and fade for splash exit
    const translateY = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -layouts.screen.height * 0.3],
    });

    const opacity = current.progress.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [1, 0.3, 0],
    });

    const scale = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.9],
    });

    return {
      cardStyle: {
        transform: [{ translateY }, { scale }],
        opacity,
      },
    };
  },
};

// Default smooth transition configuration
export const defaultTransition = slideFromRightTransition;

// Transition configurations for different screen types
export const transitionConfigs = {
  splash: splashExitTransition,
  modal: slideUpTransition,
  auth: fadeTransition,
  main: slideFromRightTransition,
  settings: slideFromRightTransition,
  back: slideFromLeftTransition,
  scale: scaleTransition,
};

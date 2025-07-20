# Smooth Transitions Guide for PrismaNote

This guide explains how to use the smooth transition system implemented in the PrismaNote app.

## Overview

The app now features a comprehensive transition system that provides smooth, theme-aware animations between screens. The system automatically uses:
- **Dark mode**: Black background (`#000000`) for transitions
- **Light mode**: Light grey background (`#f5f5f5`) for transitions

## Components Available

### 1. PageTransition
Use for standard screen transitions with slide-in animation.

```tsx
import { PageTransition } from '../src/components/ui/PageTransition';

export default function MyScreen() {
  return (
    <PageTransition duration={350}>
      <YourScreenContent />
    </PageTransition>
  );
}
```

### 2. ModalTransition
Use for modal screens with slide-up and scale animation.

```tsx
import { ModalTransition } from '../src/components/ui/PageTransition';

export default function MyModal() {
  return (
    <ModalTransition duration={400}>
      <YourModalContent />
    </ModalTransition>
  );
}
```

### 3. TransitionWrapper
More flexible component with multiple transition types.

```tsx
import { TransitionWrapper } from '../src/components/ui/TransitionWrapper';

export default function MyScreen() {
  return (
    <TransitionWrapper transitionType="fade" duration={300}>
      <YourContent />
    </TransitionWrapper>
  );
}
```

Available transition types:
- `slide` - Slide from right (default)
- `fade` - Fade in
- `scale` - Scale up
- `slideUp` - Slide up from bottom

## Theme Integration

All transition components automatically adapt to the current theme:

### Dark Mode
- Background: `#000000` (black)
- Text: `#ffffff` (white)
- Primary color: Dynamic based on theme

### Light Mode
- Background: `#f5f5f5` (light grey)
- Text: `#000000` (black)
- Primary color: Dynamic based on theme

## Usage Examples

### Basic Screen with Transition
```tsx
// app/my-screen.tsx
import { PageTransition } from '../src/components/ui/PageTransition';
import MyScreenComponent from '../src/screens/MyScreenComponent';

export default function MyScreen() {
  return (
    <PageTransition>
      <MyScreenComponent />
    </PageTransition>
  );
}
```

### Modal with Custom Duration
```tsx
// app/my-modal.tsx
import { ModalTransition } from '../src/components/ui/PageTransition';
import MyModalComponent from '../src/screens/MyModalComponent';

export default function MyModal() {
  return (
    <ModalTransition duration={500}>
      <MyModalComponent />
    </ModalTransition>
  );
}
```

### Custom Transition Type
```tsx
// app/special-screen.tsx
import { TransitionWrapper } from '../src/components/ui/TransitionWrapper';
import SpecialScreenComponent from '../src/screens/SpecialScreenComponent';

export default function SpecialScreen() {
  return (
    <TransitionWrapper transitionType="scale" duration={400} delay={100}>
      <SpecialScreenComponent />
    </TransitionWrapper>
  );
}
```

## Configuration Files

### Transition Utilities
- `src/utils/transitions.ts` - Transition configurations for React Navigation
- `src/utils/transitionColors.ts` - Theme-aware color utilities

### Component Files
- `src/components/ui/PageTransition.tsx` - Standard page transitions
- `src/components/ui/TransitionWrapper.tsx` - Flexible transition wrapper

## Current Implementation

The following screens already use smooth transitions:
- ✅ Splash Screen → Main App (custom fade and slide)
- ✅ Login Screen (PageTransition)
- ✅ Loading states (theme-aware backgrounds)

## Next Steps

To add transitions to other screens:
1. Import the appropriate transition component
2. Wrap your screen content
3. The component will automatically use theme-appropriate colors
4. Customize duration and delay as needed

The transition system is fully integrated with the ThemeContext, so all backgrounds will automatically switch between light grey and black based on the user's theme preference.

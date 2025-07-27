import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernDialog } from '../src/components/ui/ModernDialog';
import { useTheme } from '../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

const scientificButtons = [
  ['(', ')', 'ans', 'π', 'e', 'C'],
  ['x²', '√', 'ln', 'log', '^', '!'],
  ['sin', 'cos', 'tan', 'deg', 'rad', '1/x'],
  ['m+', 'm-', 'mr', 'mc', 'EE', 'mod'],
];

const basicButtons = [
  ['AC', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['SCI', '0', '.', '='],
];

// Safe math evaluator to replace eval()
class SafeMathEvaluator {
  private angleMode: 'deg' | 'rad' = 'deg';
  
  setAngleMode(mode: 'deg' | 'rad') {
    this.angleMode = mode;
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  private toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
  
  private factorial(n: number): number {
    if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial requires non-negative integer');
    if (n > 170) throw new Error('Factorial too large');
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  
  evaluate(expression: string): number {
    // Remove spaces
    expression = expression.replace(/\s/g, '');
    
    // Replace mathematical constants and functions
    expression = expression
      .replace(/π/g, Math.PI.toString())
      .replace(/e(?![0-9])/g, Math.E.toString())
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .replace(/−/g, '-')
      .replace(/--/g, '+');
    
    // Handle scientific functions
    expression = this.replaceFunctions(expression);
    
    // Validate expression contains only allowed characters
    if (!/^[0-9+\-*/.()√π\s]+$/.test(expression.replace(/Math\.\w+\([^)]*\)/g, '1'))) {
      throw new Error('Invalid characters in expression');
    }
    
    try {
      // Use Function constructor instead of eval for better safety
      const result = new Function('return ' + expression)();
      return Number(result);
    } catch (error) {
      throw new Error('Invalid expression');
    }
  }
  
  private replaceFunctions(expression: string): string {
    // Handle factorial
    expression = expression.replace(/(\d+(?:\.\d+)?)!/g, (match, num) => {
      try {
        return this.factorial(parseFloat(num)).toString();
      } catch {
        throw new Error('Invalid factorial');
      }
    });
    
    // Handle power operations
    expression = expression.replace(/([^*+\-/^]+)\^([^*+\-/^]+)/g, 'Math.pow($1,$2)');
    expression = expression.replace(/([^*+\-/²]+)²/g, 'Math.pow($1,2)');
    
    // Handle square root
    expression = expression.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
    expression = expression.replace(/√([0-9.]+)/g, 'Math.sqrt($1)');
    
    // Handle trigonometric functions
    const angleConvert = this.angleMode === 'deg' ? 'Math.PI/180*' : '';
    expression = expression.replace(/sin\(([^)]+)\)/g, `Math.sin(${angleConvert}$1)`);
    expression = expression.replace(/cos\(([^)]+)\)/g, `Math.cos(${angleConvert}$1)`);
    expression = expression.replace(/tan\(([^)]+)\)/g, `Math.tan(${angleConvert}$1)`);
    
    // Handle logarithms
    expression = expression.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
    expression = expression.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');
    
    // Handle reciprocal
    expression = expression.replace(/1\/([^*+\-/]+)/g, '(1/($1))');
    
    return expression;
  }
}

export default function CalculatorScreen() {
  const { theme, colors } = useTheme();
  const router = useRouter();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isScientific, setIsScientific] = useState(false);
  const [ans, setAns] = useState('0');
  const [memory, setMemory] = useState('0');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [showCursor, setShowCursor] = useState(true);
  const [dialog, setDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: ''
  });

  const animation = useRef(new Animated.Value(0)).current;
  const buttonAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
  const cursorAnimation = useRef(new Animated.Value(1)).current;
  const mathEvaluator = useRef(new SafeMathEvaluator()).current;

  const showDialog = (title: string, message: string) => {
    setDialog({
      visible: true,
      title,
      message
    });
  };

  const hideDialog = () => {
    setDialog(prev => ({ ...prev, visible: false }));
  };

  // Cursor blinking animation
  useEffect(() => {
    const blinkCursor = () => {
      Animated.sequence([
        Animated.timing(cursorAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => blinkCursor());
    };
    blinkCursor();
  }, []);

  // Button press animation with haptic feedback
  const animateButtonPress = (buttonKey: string) => {
    // Add haptic feedback for better UX
    Vibration.vibrate(50);
    
    if (!buttonAnimations[buttonKey]) {
      buttonAnimations[buttonKey] = new Animated.Value(0);
    }
    
    Animated.sequence([
      Animated.timing(buttonAnimations[buttonKey], {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(buttonAnimations[buttonKey], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Live calculation preview with improved error handling
  useEffect(() => {
    if (expression && expression !== '' && !expression.endsWith('=')) {
      try {
        mathEvaluator.setAngleMode(angleMode);
        
        // Only evaluate if expression seems complete (doesn't end with operator)
        if (!/[+\-×÷^]$/.test(expression) && !expression.includes('(') || 
            (expression.includes('(') && expression.split('(').length === expression.split(')').length)) {
          const evaluated = mathEvaluator.evaluate(expression);
          if (isFinite(evaluated) && !isNaN(evaluated)) {
            const roundedResult = Math.round(evaluated * 1000000000) / 1000000000;
            setResult(roundedResult.toString());
          } else {
            setResult('');
          }
        } else {
          setResult('');
        }
      } catch {
        setResult('');
      }
    } else {
      setResult('');
    }
  }, [expression, angleMode]);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isScientific ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isScientific]);

  // Input validation helper
  const isValidInput = (currentExpression: string, newInput: string): boolean => {
    const lastChar = currentExpression.slice(-1);
    const operators = ['+', '−', '×', '÷', '^'];
    
    // Don't allow consecutive operators
    if (operators.includes(lastChar) && operators.includes(newInput)) {
      return false;
    }
    
    // Don't allow multiple decimal points in the same number
    if (newInput === '.') {
      const parts = currentExpression.split(/[+\-×÷^()]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) {
        return false;
      }
    }
    
    return true;
  };

  const handlePress = (val: string) => {
    // Trigger button animation
    animateButtonPress(val);
    
    if (val === 'AC' || val === '⌫') {
      if (expression.length > 0) {
        setExpression(prev => prev.slice(0, -1));
      } else {
        setExpression('');
        setResult('');
      }
    } else if (val === '=') {
      try {
        mathEvaluator.setAngleMode(angleMode);
        const evaluated = mathEvaluator.evaluate(expression);
        
        if (isNaN(evaluated)) {
          showDialog('Error', 'Result is undefined');
          setResult('');
        } else if (!isFinite(evaluated)) {
          showDialog('Error', 'Result is infinite');
          setResult('');
        } else {
          const roundedResult = Math.round(evaluated * 1000000000) / 1000000000;
          setResult(String(roundedResult));
          setAns(String(roundedResult));
          setHistory(prev => [`${expression} = ${roundedResult}`, ...prev.slice(0, 9)]);
        }
      } catch (error) {
        showDialog('Error', error instanceof Error ? error.message : 'Invalid Expression');
        setResult('');
      }
    } else if (val === 'ans') {
      setExpression(prev => prev + ans);
    } else if (val === '±') {
      if (expression) {
        if (expression.startsWith('-')) {
          setExpression(prev => prev.slice(1));
        } else {
          setExpression(prev => '-' + prev);
        }
      }
    } else if (val === 'SCI') {
      setIsScientific(prev => !prev);
    } else if (val === '%') {
      if (expression) {
        try {
          mathEvaluator.setAngleMode(angleMode);
          const evaluated = mathEvaluator.evaluate(expression);
          
          if (isNaN(evaluated) || !isFinite(evaluated)) {
            showDialog('Error', 'Invalid Expression');
          } else {
            setExpression((evaluated / 100).toString());
          }
        } catch {
          showDialog('Error', 'Invalid Expression');
        }
      }
    } else if (val === 'C') {
      setExpression('');
      setResult('');
    } else if (val === 'x²') {
      if (expression) {
        setExpression(prev => `(${prev})²`);
      }
    } else if (val === '√') {
      setExpression(prev => prev ? `√(${prev})` : '√(');
    } else if (val === 'sin') {
      setExpression(prev => prev ? `sin(${prev})` : 'sin(');
    } else if (val === 'cos') {
      setExpression(prev => prev ? `cos(${prev})` : 'cos(');
    } else if (val === 'tan') {
      setExpression(prev => prev ? `tan(${prev})` : 'tan(');
    } else if (val === 'ln') {
      setExpression(prev => prev ? `ln(${prev})` : 'ln(');
    } else if (val === 'log') {
      setExpression(prev => prev ? `log(${prev})` : 'log(');
    } else if (val === '^') {
      setExpression(prev => prev + '^');
    } else if (val === '!') {
      if (expression) {
        setExpression(prev => prev + '!');
      }
    } else if (val === '1/x') {
      if (expression) {
        setExpression(prev => `1/(${prev})`);
      } else {
        setExpression('1/');
      }
    } else if (val === 'deg') {
      setAngleMode('deg');
      showDialog('Mode Changed', 'Angle mode set to degrees');
    } else if (val === 'rad') {
      setAngleMode('rad');
      showDialog('Mode Changed', 'Angle mode set to radians');
    } else if (val === 'm+') {
      if (result) {
        try {
          const currentMemory = parseFloat(memory);
          const currentResult = parseFloat(result);
          setMemory((currentMemory + currentResult).toString());
          showDialog('Memory', `Added ${result} to memory`);
        } catch {
          showDialog('Error', 'Cannot add to memory');
        }
      }
    } else if (val === 'm-') {
      if (result) {
        try {
          const currentMemory = parseFloat(memory);
          const currentResult = parseFloat(result);
          setMemory((currentMemory - currentResult).toString());
          showDialog('Memory', `Subtracted ${result} from memory`);
        } catch {
          showDialog('Error', 'Cannot subtract from memory');
        }
      }
    } else if (val === 'mr') {
      setExpression(prev => prev + memory);
      showDialog('Memory', `Recalled: ${memory}`);
    } else if (val === 'mc') {
      setMemory('0');
      showDialog('Memory', 'Memory cleared');
    } else if (val === 'mod') {
      setExpression(prev => prev + '%');
    } else if (val === 'EE') {
      setExpression(prev => prev + 'e');
    } else if (val === 'π') {
      setExpression(prev => prev + 'π');
    } else if (val === 'e') {
      setExpression(prev => prev + 'e');
    } else {
      // Apply input validation for basic inputs
      if (['+', '−', '×', '÷', '^', '.'].includes(val)) {
        if (isValidInput(expression, val)) {
          setExpression(prev => prev + val);
        } else {
          // Provide feedback for invalid input
          Vibration.vibrate([100, 50, 100]);
        }
      } else {
        setExpression(prev => prev + val);
      }
    }
  };

  const handleLongPressDelete = () => {
    setExpression('');
    setResult('');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const renderButton = (label: string, isScientificMode = false) => {
    const isOperator = /[÷×−+]/.test(label);
    const isEquals = label === '=';
    const isSpecial = ['AC', '⌫', '±', '%'].includes(label);
    const isScientificFunc = ['sin', 'cos', 'tan', 'ln', 'log', 'x²', '√', 'π', 'e', '(', ')', 'ans', 'C', '^', '!', 'deg', 'rad', '1/x', 'mod', 'EE'].includes(label);
    const isMemoryFunc = ['m+', 'm-', 'mr', 'mc'].includes(label);
    const isActiveMode = (label === 'deg' && angleMode === 'deg') || (label === 'rad' && angleMode === 'rad');
    const hasMemory = parseFloat(memory) !== 0 && ['mr', 'mc'].includes(label);
    
    // Initialize animation value if it doesn't exist
    if (!buttonAnimations[label]) {
      buttonAnimations[label] = new Animated.Value(0);
    }
    
    const buttonStyle = isScientificMode ? {
      width: Math.min(50, width * 0.12),
      height: Math.min(50, width * 0.12),
      borderRadius: Math.min(25, width * 0.06),
    } : {};
    
    return (
      <Animated.View
        key={label}
        style={[
          {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: buttonAnimations[label].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.4],
            }),
            shadowRadius: buttonAnimations[label].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 10],
            }),
            elevation: buttonAnimations[label].interpolate({
              inputRange: [0, 1],
              outputRange: [3, 8],
            }),
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            buttonStyle,
            isEquals && { backgroundColor: colors.primary },
            isOperator && { backgroundColor: colors.primary },
            isSpecial && { backgroundColor: theme === 'dark' ? '#505050' : '#a6a6a6' },
            isScientificFunc && { backgroundColor: theme === 'dark' ? '#404040' : '#d4d4d2' },
            isMemoryFunc && { backgroundColor: theme === 'dark' ? '#2a4d3a' : '#b8e6c4' },
            isActiveMode && { backgroundColor: colors.primary },
            hasMemory && { backgroundColor: theme === 'dark' ? '#3a5f3a' : '#90ee90' },
            !isOperator && !isEquals && !isSpecial && !isScientificFunc && !isMemoryFunc && { backgroundColor: theme === 'dark' ? '#333333' : '#e0e0e0' }
          ]}
          onPress={() => handlePress(label)}
          onLongPress={(label === 'AC' || label === '⌫') ? handleLongPressDelete : undefined}
        >
          <Text style={[
            styles.buttonText,
            isScientificMode && { fontSize: 14 },
            (isSpecial || (isScientificFunc && !isOperator && !isEquals)) && { color: theme === 'dark' ? '#fff' : '#000' },
            isMemoryFunc && { color: theme === 'dark' ? '#90ee90' : '#006400' },
            isActiveMode && { color: '#fff', fontWeight: 'bold' },
            hasMemory && { color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' },
            !isOperator && !isEquals && !isSpecial && !isScientificFunc && !isMemoryFunc && { color: theme === 'dark' ? '#fff' : '#000' }
          ]}>
            {label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const scientificTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 0],
  });
  const scientificOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
      {/* Header with back button */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Calculator</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingBottom: 100,
          justifyContent: 'flex-end'
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.displayContainer}>
          {/* Status indicators */}
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: colors.text }]}>
              {angleMode.toUpperCase()}
            </Text>
            {parseFloat(memory) !== 0 && (
              <Text style={[styles.statusText, { color: colors.primary }]}>
                M: {memory}
              </Text>
            )}
          </View>
          
          <View style={styles.expressionContainer}>
            <Text style={[styles.expression, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              {expression || '0'}
            </Text>
            <Animated.View style={[
              styles.cursor,
              { 
                opacity: cursorAnimation,
                backgroundColor: colors.primary 
              }
            ]} />
          </View>
          <Text style={[styles.result, { color: theme === 'dark' ? '#999' : '#444' }]}>{result}</Text>
        </View>

        {/** Animated Scientific Container */}
        <Animated.View
          style={{
            opacity: scientificOpacity,
            transform: [{ translateY: scientificTranslate }],
          }}
        >
          {isScientific && (
            <View style={styles.scientificContainer}>
              {scientificButtons.map((row, idx) => (
                <View key={idx} style={styles.row}>
                  {row.map(label => renderButton(label, true))}
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {basicButtons.map((row, idx) => (
          <View key={idx} style={styles.row}>
            {row.map(label => {
              let actualLabel = label;
              if (label === 'AC' && expression.length > 0) actualLabel = '⌫';
              return renderButton(actualLabel);
            })}
          </View>
        ))}

        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}>History</Text>
          <ScrollView style={styles.historyScroll}>
            {history.map((entry, idx) => (
              <TouchableOpacity 
                key={idx} 
                onPress={() => {
                  const parts = entry.split(' = ');
                  if (parts.length === 2) {
                    setExpression(parts[0]);
                    showDialog('History', 'Expression loaded from history');
                  }
                }}
                style={styles.historyItem}
              >
                <Text style={[styles.historyText, { color: theme === 'dark' ? '#999' : '#666' }]}>
                  {entry}
                </Text>
              </TouchableOpacity>
            ))}
            {history.length === 0 && (
              <Text style={[styles.emptyHistoryText, { color: theme === 'dark' ? '#666' : '#999' }]}>
                No calculations yet
              </Text>
            )}
          </ScrollView>
          <View style={styles.historyActions}>
            <TouchableOpacity onPress={clearHistory} style={styles.clearHistoryButton}>
              <Text style={styles.clearHistoryText}>Clear History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ModernDialog
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        buttons={[{ text: 'OK', onPress: hideDialog }]}
        onClose={hideDialog}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 10,
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40, // Same width as back button to center the title
  },
  displayContainer: {
    padding: 20,
    alignItems: 'flex-end',
    minHeight: 120,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  expressionContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  expression: {
    fontSize: 36,
    fontWeight: '300',
  },
  cursor: {
    width: 2,
    height: 36,
    marginLeft: 2,
    marginBottom: 2,
  },
  result: {
    fontSize: 24,
    marginTop: 4,
    fontWeight: '200',
  },
  scientificContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  button: {
    width: Math.min(70, width * 0.18),
    height: Math.min(70, width * 0.18),
    borderRadius: Math.min(35, width * 0.09),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    margin: 2,
  },
  tinyButton: {
    // Remove override styling for scientific mode
  },
  buttonText: {
    fontSize: Math.min(24, width * 0.06),
    color: '#fff',
    fontWeight: '400',
  },
  tinyButtonText: {
    fontSize: 16,
  },
  operator: {
    // Background color applied dynamically
  },
  equals: {
    // Background color applied dynamically
  },
  special: {
    // Dynamic background color applied inline
  },
  scientific: {
    // Dynamic background color applied inline
  },
  number: {
    // Dynamic background color applied inline
  },
  historySection: {
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 15,
    marginHorizontal: 10,
    padding: 15,
  },
  historyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  historyScroll: {
    maxHeight: 120,
  },
  historyItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 1,
  },
  historyText: {
    marginVertical: 2,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  emptyHistoryText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  historyActions: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  clearHistoryButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  clearHistoryText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '600',
  },
});
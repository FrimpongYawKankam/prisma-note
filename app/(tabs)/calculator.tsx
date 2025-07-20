import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ModernDialog } from '../../src/components/ui/ModernDialog';
import { useTheme } from '../../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

const scientificButtons = [
  ['(', ')', 'ans', 'π', 'e', 'C'],
  ['x²', '√', 'ln', 'log₁₀', '^', '!'],
  ['sin', 'cos', 'tan', 'deg', 'rad', '1/x'],
  ['exp', 'mod', 'abs', 'rand', 'EE', 'mc'],
];

const basicButtons = [
  ['AC', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['SCI', '0', '.', '='],
];

export default function CalculatorScreen() {
  const { theme, colors } = useTheme();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isScientific, setIsScientific] = useState(false);
  const [ans, setAns] = useState('0');
  const [memory, setMemory] = useState('0');
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

  // Button press animation
  const animateButtonPress = (buttonKey: string) => {
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

  // Live calculation preview
  useEffect(() => {
    if (expression && expression !== '' && !expression.endsWith('=')) {
      try {
        let evalExpression = expression
          .replace(/÷/g, '/')
          .replace(/×/g, '*')
          .replace(/−/g, '-')
          .replace(/π/g, Math.PI.toString())
          .replace(/e(?![0-9])/g, Math.E.toString())
          .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
          .replace(/sin\(([^)]+)\)/g, 'Math.sin($1)')
          .replace(/cos\(([^)]+)\)/g, 'Math.cos($1)')
          .replace(/tan\(([^)]+)\)/g, 'Math.tan($1)')
          .replace(/ln\(([^)]+)\)/g, 'Math.log($1)')
          .replace(/log\(([^)]+)\)/g, 'Math.log10($1)')
          .replace(/([^)]+)²/g, 'Math.pow($1, 2)');
        
        // Only evaluate if expression seems complete
        if (!/[+\-×÷]$/.test(expression)) {
          const evaluated = eval(evalExpression);
          if (isFinite(evaluated)) {
            const roundedResult = Math.round(evaluated * 1000000000) / 1000000000;
            setResult(roundedResult.toString());
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
  }, [expression]);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isScientific ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isScientific]);

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
        let evalExpression = expression
          .replace(/÷/g, '/')
          .replace(/×/g, '*')
          .replace(/−/g, '-')
          .replace(/π/g, Math.PI.toString())
          .replace(/e/g, Math.E.toString());
        
        const evaluated = eval(evalExpression);
        const roundedResult = Math.round(evaluated * 1000000000) / 1000000000; // Round to 9 decimal places
        setResult(String(roundedResult));
        setAns(String(roundedResult));
        setHistory(prev => [`${expression} = ${roundedResult}`, ...prev.slice(0, 9)]); // Keep only last 10 entries
      } catch {
        showDialog('Error', 'Invalid Expression');
        setResult('Error');
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
          const evaluated = eval(expression.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-'));
          setExpression((evaluated / 100).toString());
        } catch {
          showDialog('Error', 'Invalid Expression');
        }
      }
    } else if (val === 'x²') {
      if (expression) {
        setExpression(prev => `(${prev})²`);
      }
    } else if (val === '√') {
      setExpression(prev => `√(${prev})`);
    } else if (val === 'sin') {
      setExpression(prev => `sin(${prev})`);
    } else if (val === 'cos') {
      setExpression(prev => `cos(${prev})`);
    } else if (val === 'tan') {
      setExpression(prev => `tan(${prev})`);
    } else if (val === 'ln') {
      setExpression(prev => `ln(${prev})`);
    } else if (val === 'log₁₀') {
      setExpression(prev => `log(${prev})`);
    } else if (val === 'π') {
      setExpression(prev => prev + 'π');
    } else if (val === 'e') {
      setExpression(prev => prev + 'e');
    } else {
      setExpression(prev => prev + val);
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
    const isScientificFunc = ['sin', 'cos', 'tan', 'ln', 'log₁₀', 'x²', 'x³', '√', 'π', 'e', '(', ')', 'ans', 'C', '^', '!', 'deg', 'rad', '1/x', 'exp', 'mod', 'abs', 'rand', 'EE', 'mc'].includes(label);
    
    // Initialize animation value if it doesn't exist
    if (!buttonAnimations[label]) {
      buttonAnimations[label] = new Animated.Value(0);
    }
    
    const buttonStyle = isScientificMode ? {
      width: 50,
      height: 50,
      borderRadius: 25,
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
            !isOperator && !isEquals && !isSpecial && !isScientificFunc && { backgroundColor: theme === 'dark' ? '#333333' : '#e0e0e0' }
          ]}
          onPress={() => handlePress(label)}
          onLongPress={(label === 'AC' || label === '⌫') ? handleLongPressDelete : undefined}
        >
          <Text style={[
            styles.buttonText,
            isScientificMode && { fontSize: 14 },
            (isSpecial || (isScientificFunc && !isOperator && !isEquals)) && { color: theme === 'dark' ? '#fff' : '#000' },
            !isOperator && !isEquals && !isSpecial && !isScientificFunc && { color: theme === 'dark' ? '#fff' : '#000' }
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
              <Text key={idx} style={[styles.historyText, { color: theme === 'dark' ? '#999' : '#666' }]}>{entry}</Text>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={clearHistory} style={styles.clearHistoryButton}>
            <Text style={styles.clearHistoryText}>Clear History</Text>
          </TouchableOpacity>
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
  displayContainer: {
    padding: 20,
    alignItems: 'flex-end',
    minHeight: 120,
  },
  expressionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  tinyButton: {
    // Remove override styling for scientific mode
  },
  buttonText: {
    fontSize: 24,
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
  historyText: {
    marginVertical: 2,
    fontSize: 14,
    fontFamily: 'monospace',
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

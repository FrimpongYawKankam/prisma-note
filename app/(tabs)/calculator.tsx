import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

const scientificButtons = [
  ['(', ')', 'mc', 'm+', 'm-', 'mr'],
  ['2ⁿᵈ', 'x²', 'x³', 'xʸ', 'eˣ', '10ˣ'],
  ['1/x', '²√x', '³√x', 'ʸ√x', 'ln', 'log₁₀'],
  ['x!', 'sin', 'cos', 'tan', 'e', 'EE'],
  ['Rand', 'sinh', 'cosh', 'tanh', 'π', 'Rad'],
];

const basicButtons = [
  ['AC', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['SCI', '0', '.', '='],
];

export default function CalculatorScreen() {
  const { theme } = useTheme();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isScientific, setIsScientific] = useState(false);
  const [ans, setAns] = useState('');

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isScientific ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isScientific]);

  const handlePress = (val: string) => {
    if (val === 'AC' || val === '⌫') {
      if (expression.length > 0) {
        setExpression(prev => prev.slice(0, -1));
      } else {
        setExpression('');
        setResult('');
      }
    } else if (val === '=') {
      try {
        const evaluated = eval(expression.replace(/÷/g, '/').replace(/×/g, '*'));
        setResult(String(evaluated));
        setAns(String(evaluated));
        setHistory(prev => [`${expression} = ${evaluated}`, ...prev]);
      } catch {
        Alert.alert('Invalid Expression');
      }
    } else if (val === '🔁') {
      setExpression(prev => prev + ans);
    } else if (val === '±') {
      setExpression(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
    } else if (val === 'SCI') {
      setIsScientific(prev => !prev);
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

  const renderButton = (label: string) => (
    <TouchableOpacity
      key={label}
      style={[styles.button, styles.tinyButton, label === '=' ? styles.equals : /[÷×−+]/.test(label) ? styles.operator : {}]}
      onPress={() => handlePress(label)}
      onLongPress={(label === 'AC' || label === '⌫') ? handleLongPressDelete : undefined}
    >
      <Text style={[styles.buttonText, styles.tinyButtonText]}>{label}</Text>
    </TouchableOpacity>
  );

  const scientificTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 0],
  });
  const scientificOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.displayContainer}>
        <Text style={[styles.expression, { color: theme === 'dark' ? '#fff' : '#000' }]}>{expression || '0'}</Text>
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
                {row.map(label => renderButton(label))}
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
        <Text style={styles.historyTitle}>History</Text>
        <ScrollView style={styles.historyScroll}>
          {history.map((entry, idx) => (
            <Text key={idx} style={styles.historyText}>{entry}</Text>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={clearHistory} style={styles.clearHistoryButton}>
          <Text style={styles.clearHistoryText}>Clear History</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  },
  expression: {
    fontSize: 36,
  },
  result: {
    fontSize: 24,
    marginTop: 4,
  },
  scientificContainer: {
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#333',
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 30,
    alignItems: 'center',
  },
  tinyButton: {
    paddingVertical: height * 0.014,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
  tinyButtonText: {
    fontSize: 16,
  },
  operator: {
    backgroundColor: '#f90',
  },
  equals: {
    backgroundColor: '#f90',
  },
  historySection: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  historyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  historyScroll: {
    maxHeight: 100,
  },
  historyText: {
    color: '#999',
  },
  clearHistoryButton: {
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  clearHistoryText: {
    color: '#f00',
    fontSize: 14,
  },
});

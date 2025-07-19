import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

const CalculatorScreen = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const { theme } = useTheme();

  const handlePress = (value: string) => {
    if (value === '=') {
      try {
        setResult(eval(input).toString());
      } catch {
        setResult('Error');
      }
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else {
      setInput((prev) => prev + value);
    }
  };

  const buttonValues = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
    ['C']
  ];

  const isDark = theme === 'dark';
  const styles = getStyles(isDark);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.inputText}>{input}</Text>
        <Text style={styles.resultText}>{result}</Text>
      </View>
      <View style={styles.buttons}>
        {buttonValues.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((val) => (
              <TouchableOpacity key={val} style={styles.button} onPress={() => handlePress(val)}>
                <Text style={styles.buttonText}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </KeyboardAvoidingView>
  );
};

export default CalculatorScreen;

const getStyles = (dark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark ? '#1c1c1c' : '#f0f0f0',
    padding: 16,
    justifyContent: 'center',
  },
  display: {
    backgroundColor: dark ? '#2a2a2a' : '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: dark ? '#000' : '#aaa',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  inputText: {
    fontSize: 28,
    color: dark ? '#fff' : '#333',
    textAlign: 'right',
  },
  resultText: {
    fontSize: 20,
    color: dark ? '#aaa' : '#666',
    textAlign: 'right',
    marginTop: 8,
  },
  buttons: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: dark ? '#333' : '#ddd',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: dark ? '#fff' : '#000',
  },
});

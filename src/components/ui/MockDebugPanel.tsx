import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getServiceMode, isUsingMockServices, mockDataUtils } from '../../mockFunctionality';
import { MOCK_CONFIG } from '../../mockFunctionality/utils/constants';

interface MockDebugPanelProps {
  visible?: boolean;
}

export const MockDebugPanel: React.FC<MockDebugPanelProps> = ({ visible = __DEV__ }) => {
  const { colors } = useTheme();
  const [mockStatus, setMockStatus] = useState<any>(null);
  
  useEffect(() => {
    if (visible && isUsingMockServices()) {
      loadMockStatus();
    }
  }, [visible]);
  
  const loadMockStatus = async () => {
    const status = await mockDataUtils.getMockDataStatus();
    setMockStatus(status);
  };
  
  const handleResetData = () => {
    Alert.alert(
      'Reset Mock Data',
      'This will reset all mock data to initial state. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await mockDataUtils.resetMockData();
            await loadMockStatus();
            Alert.alert('Success', 'Mock data has been reset');
          }
        }
      ]
    );
  };
  
  const handleClearData = () => {
    Alert.alert(
      'Clear Mock Data',
      'This will clear ALL mock data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await mockDataUtils.clearMockData();
            await loadMockStatus();
            Alert.alert('Success', 'Mock data has been cleared');
          }
        }
      ]
    );
  };
  
  // Only show in development and if using mock services
  if (!visible || !isUsingMockServices()) {
    return null;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.primary }]}>🎭 Mock Debug Panel</Text>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Mode: {getServiceMode()}</Text>
        <Text style={[styles.label, { color: colors.text }]}>
          Test Email: {MOCK_CONFIG.TEST_USER.email}
        </Text>
        <Text style={[styles.label, { color: colors.text }]}>
          Test Password: {MOCK_CONFIG.TEST_USER.password}
        </Text>
        
        {mockStatus && (
          <View style={styles.statusContainer}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>Data Status:</Text>
            <Text style={[styles.statusItem, { color: colors.textSecondary }]}>
              👤 User: {mockStatus.details?.hasUser ? '✅' : '❌'}
            </Text>
            <Text style={[styles.statusItem, { color: colors.textSecondary }]}>
              📝 Notes: {mockStatus.details?.hasNotes ? '✅' : '❌'}
            </Text>
            <Text style={[styles.statusItem, { color: colors.textSecondary }]}>
              🔑 Token: {mockStatus.details?.hasToken ? '✅' : '❌'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={loadMockStatus}
        >
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ff9800' }]}
          onPress={handleResetData}
        >
          <Text style={styles.buttonText}>Reset Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#f44336' }]}
          onPress={handleClearData}
        >
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 200,
    zIndex: 1000,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    marginBottom: 2,
  },
  statusContainer: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statusTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusItem: {
    fontSize: 10,
    marginBottom: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flex: 1,
    minWidth: 60,
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

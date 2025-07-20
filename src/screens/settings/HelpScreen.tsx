import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { safeNavigateBack } from '../../utils/navigation';

export default function HelpScreen() {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
      {/* Header with Back Button and Title */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeNavigateBack('/')}>
          <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>
            Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>
          Help & Support
        </Text>
      </View>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Getting Started Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Getting Started
          </Text>
          <View style={[styles.helpCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: isDark ? '#fff' : '#000' }]}>
                Creating Your First Note
              </Text>
              <Text style={[styles.helpText, { color: isDark ? '#aaa' : '#666' }]}>
                Tap the "+" icon to create a new note. Add a title and start writing your content.
              </Text>
            </View>
          </View>
          
          <View style={[styles.helpCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: isDark ? '#fff' : '#000' }]}>
                Editing Notes
              </Text>
              <Text style={[styles.helpText, { color: isDark ? '#aaa' : '#666' }]}>
                Tap on any note to open and edit it. Your changes are automatically saved.
              </Text>
            </View>
          </View>
        </View>

        {/* Managing Notes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Managing Notes
          </Text>
          <View style={[styles.helpCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="trash-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: isDark ? '#fff' : '#000' }]}>
                Deleting Notes
              </Text>
              <Text style={[styles.helpText, { color: isDark ? '#aaa' : '#666' }]}>
                Swipe left on a note or use the delete button to move it to trash.
              </Text>
            </View>
          </View>
          
          <View style={[styles.helpCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="search-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: isDark ? '#fff' : '#000' }]}>
                Finding Notes
              </Text>
              <Text style={[styles.helpText, { color: isDark ? '#aaa' : '#666' }]}>
                Use the search function to quickly find notes by title or content.
              </Text>
            </View>
          </View>
        </View>

        {/* App Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            App Features
          </Text>
          <View style={[styles.helpCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: isDark ? '#fff' : '#000' }]}>
                Events & Tasks
              </Text>
              <Text style={[styles.helpText, { color: isDark ? '#aaa' : '#666' }]}>
                Organize your schedule with events and manage daily tasks efficiently.
              </Text>
            </View>
          </View>
          
          <View style={[styles.helpCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="calculator-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: isDark ? '#fff' : '#000' }]}>
                Built-in Calculator
              </Text>
              <Text style={[styles.helpText, { color: isDark ? '#aaa' : '#666' }]}>
                Access the calculator from the tab bar for quick calculations.
              </Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Need More Help?
          </Text>
          <View style={[styles.supportCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.supportTitle, { color: colors.primary }]}>
              Contact Support
            </Text>
            <Text style={[styles.supportText, { color: isDark ? '#aaa' : '#666' }]}>
              If you need additional assistance, please reach out to our support team. We're here to help!
            </Text>
            <TouchableOpacity style={[styles.supportButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.supportButtonText}>Get Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    lineHeight: 30,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '500',
    lineHeight: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helpCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
  supportCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  supportButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  supportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

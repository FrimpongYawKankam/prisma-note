import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernCard } from '../../components/ui/ModernCard';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { safeNavigateBack } from '../../utils/navigation';

export default function HelpScreen() {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const handleContactSupport = () => {
    const email = 'support@prismanote.com';
    const subject = 'Help Request - Prisma Note';
    const body = 'Hi,\n\nI need help with Prisma Note:\n\n[Please describe your issue here]\n\nThanks!';
    
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      .catch(() => {
        Alert.alert(
          'Email Not Available',
          'Please send your support request to:\nsupport@prismanote.com',
          [{ text: 'OK' }]
        );
      });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => safeNavigateBack('/')}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Getting Started Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Getting Started
          </Text>
          <ModernCard style={styles.helpCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>
                Creating Your First Note
              </Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Tap the New Note button on the home screen to create a new note. Add a title and start writing your content.
              </Text>
            </View>
          </ModernCard>
          
          <ModernCard style={styles.helpCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>
                Editing Notes
              </Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Tap on any note to open and edit it. Your changes are automatically saved.
              </Text>
            </View>
          </ModernCard>
        </View>

        {/* Managing Notes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Managing Notes
          </Text>
          <ModernCard style={styles.helpCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="trash-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>
                Deleting Notes
              </Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Tap on a note to open it, then use the delete button to move it to trash.
              </Text>
            </View>
          </ModernCard>
          
          <ModernCard style={styles.helpCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="search-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>
                Finding Notes
              </Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Use the search function to quickly find notes by title or content.
              </Text>
            </View>
          </ModernCard>
        </View>

        {/* App Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            App Features
          </Text>
          <ModernCard style={styles.helpCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>
                Events & Tasks
              </Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Organize your schedule with events and manage daily tasks efficiently.
              </Text>
            </View>
          </ModernCard>
          
          <ModernCard style={styles.helpCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="calculator-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text }]}>
                Built-in Calculator
              </Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Access the calculator from the settings option for quick calculations.
              </Text>
            </View>
          </ModernCard>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Need More Help?
          </Text>
          <ModernCard style={[styles.supportCard, { borderColor: colors.primary + '30' }] as any}>
            <View style={styles.supportIconContainer}>
              <Ionicons name="help-circle" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.supportTitle, { color: colors.primary }]}>
              Contact Support
            </Text>
            <Text style={[styles.supportText, { color: colors.textSecondary }]}>
              If you need additional assistance, please reach out to our support team. We're here to help!
            </Text>
            <ModernButton
              title="Get Support"
              onPress={handleContactSupport}
              style={styles.supportButton}
            />
          </ModernCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  backText: {
    fontSize: Typography.fontSize.base,
    marginLeft: Spacing.sm,
    fontWeight: '500',
    lineHeight: Typography.lineHeight.base,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    marginBottom: Spacing.base,
  },
  helpCard: {
    flexDirection: 'row',
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.lg,
  },
  helpText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
  },
  supportCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  supportIconContainer: {
    marginBottom: Spacing.base,
  },
  supportTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  supportText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  supportButton: {
    marginTop: Spacing.sm,
  },
});
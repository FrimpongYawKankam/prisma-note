import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { ModernCard } from '../../src/components/ui/ModernCard';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';

export default function FinanceScreen() {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Finance Dashboard
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Manage your budget and expenses
          </Text>
        </View>

        {/* Placeholder Content */}
        <View style={styles.section}>
          <ModernCard style={[styles.placeholderCard, { backgroundColor: colors.surface }] as any}>
            <View style={styles.placeholderContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="wallet-outline" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.placeholderTitle, { color: colors.text }]}>
                Finance Features Coming Soon
              </Text>
              <Text style={[styles.placeholderDescription, { color: colors.textSecondary }]}>
                This section will include budget tracking, expense management, financial goals, and spending analytics.
              </Text>
            </View>
          </ModernCard>
        </View>

        {/* Feature Preview Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Planned Features
          </Text>
          
          <ModernCard style={[styles.featureCard, { backgroundColor: colors.surface }] as any}>
            <View style={styles.featureContent}>
              <View style={[styles.featureIcon, { backgroundColor: '#4CAF50' + '20' }]}>
                <Ionicons name="trending-up-outline" size={24} color="#4CAF50" />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  Budget Tracking
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Set monthly budgets and track your spending
                </Text>
              </View>
            </View>
          </ModernCard>

          <ModernCard style={[styles.featureCard, { backgroundColor: colors.surface }] as any}>
            <View style={styles.featureContent}>
              <View style={[styles.featureIcon, { backgroundColor: '#FF9800' + '20' }]}>
                <Ionicons name="receipt-outline" size={24} color="#FF9800" />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  Expense Management
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Log and categorize your daily expenses
                </Text>
              </View>
            </View>
          </ModernCard>

          <ModernCard style={[styles.featureCard, { backgroundColor: colors.surface }] as any}>
            <View style={styles.featureContent}>
              <View style={[styles.featureIcon, { backgroundColor: '#2196F3' + '20' }]}>
                <Ionicons name="pie-chart-outline" size={24} color="#2196F3" />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  Financial Analytics
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Visualize your spending patterns and trends
                </Text>
              </View>
            </View>
          </ModernCard>

          <ModernCard style={[styles.featureCard, { backgroundColor: colors.surface }] as any}>
            <View style={styles.featureContent}>
              <View style={[styles.featureIcon, { backgroundColor: '#9C27B0' + '20' }]}>
                <Ionicons name="flag-outline" size={24} color="#9C27B0" />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  Financial Goals
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Set and track your savings and financial goals
                </Text>
              </View>
            </View>
          </ModernCard>
        </View>

        {/* Development Note */}
        <View style={styles.section}>
          <ModernCard style={[styles.noteCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }] as any}>
            <View style={styles.noteContent}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.noteText, { color: colors.primary }]}>
                This section is currently under development and will be implemented by our finance team.
              </Text>
            </View>
          </ModernCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.lg,
    lineHeight: Typography.lineHeight.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    marginBottom: Spacing.base,
  },
  placeholderCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  placeholderContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  placeholderTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  placeholderDescription: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    textAlign: 'center',
  },
  featureCard: {
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm,
  },
  noteCard: {
    padding: Spacing.base,
    borderWidth: 1,
  },
  noteContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  noteText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm,
    flex: 1,
    fontWeight: '500',
  },
});

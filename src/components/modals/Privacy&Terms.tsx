import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ModernCard } from '../ui/ModernCard';
import { Spacing, Typography, BorderRadius } from '../../styles/tokens';

interface PrivacyTermsModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({ 
  visible, 
  onClose, 
  initialTab = 'privacy' 
}) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  const renderPrivacyContent = () => (
    <ModernCard style={styles.card} padding="lg">
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Information We Collect</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        We collect information you provide directly to us, such as when you create an account, 
        use our services, or contact us for support. This includes:
      </Text>
      <Text style={[styles.bulletText, { color: colors.textMuted }]}>
        • Personal information (name, email address){'\n'}
        • Account credentials{'\n'}
        • Notes and content you create{'\n'}
        • Usage data and preferences
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>How We Use Your Information</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        We use the information we collect to:
      </Text>
      <Text style={[styles.bulletText, { color: colors.textMuted }]}>
        • Provide, maintain, and improve our services{'\n'}
        • Process transactions and send notifications{'\n'}
        • Communicate with you about updates and support{'\n'}
        • Ensure security and prevent fraud
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Security</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        We implement appropriate security measures to protect your personal information 
        against unauthorized access, alteration, disclosure, or destruction. Your data is 
        encrypted both in transit and at rest.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Sharing</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        We do not sell, trade, or rent your personal information to third parties. We may 
        share information only in the following circumstances:
      </Text>
      <Text style={[styles.bulletText, { color: colors.textMuted }]}>
        • With your explicit consent{'\n'}
        • To comply with legal obligations{'\n'}
        • To protect our rights and safety
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Rights</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        You have the right to access, update, or delete your personal information. 
        You can also request data portability or restrict processing of your data.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        If you have any questions about this Privacy Policy, please contact us at:{'\n'}
        📧 privacy@prismanote.com{'\n'}
        📍 Last updated: July 2025
      </Text>
    </ModernCard>
  );

  const renderTermsContent = () => (
    <ModernCard style={styles.card} padding="lg">
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Acceptance of Terms</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        By accessing and using Prisma Note, you accept and agree to be bound by the terms 
        and provisions of this agreement. If you do not agree to these terms, please do not 
        use our service.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Use License</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        Permission is granted to use Prisma Note for personal, non-commercial purposes. 
        This license shall automatically terminate if you violate any of these restrictions.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>User Accounts</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        You are responsible for:
      </Text>
      <Text style={[styles.bulletText, { color: colors.textMuted }]}>
        • Maintaining the confidentiality of your account{'\n'}
        • All activities that occur under your account{'\n'}
        • Ensuring your account information is accurate{'\n'}
        • Notifying us of any unauthorized use
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Prohibited Uses</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        You may not use our service:
      </Text>
      <Text style={[styles.bulletText, { color: colors.textMuted }]}>
        • For any unlawful purpose{'\n'}
        • To violate any international, federal, provincial, or state regulations or laws{'\n'}
        • To transmit harmful or malicious code{'\n'}
        • To infringe upon intellectual property rights
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Availability</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        We strive to maintain high availability but do not guarantee uninterrupted access. 
        We reserve the right to modify or discontinue the service with reasonable notice.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Limitation of Liability</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        Prisma Note shall not be liable for any indirect, incidental, special, consequential, 
        or punitive damages resulting from your use of the service.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Termination</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        We may terminate or suspend your account immediately, without prior notice, for any 
        reason whatsoever, including breach of these terms.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Changes to Terms</Text>
      <Text style={[styles.bodyText, { color: colors.textMuted }]}>
        We reserve the right to modify these terms at any time. Changes will be effective 
        immediately upon posting.{'\n\n'}
        📧 Contact: legal@prismanote.com{'\n'}
        📍 Last updated: July 2025
      </Text>
    </ModernCard>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Privacy & Terms
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'privacy' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveTab('privacy')}
          >
            <Ionicons 
              name="shield-checkmark" 
              size={18} 
              color={activeTab === 'privacy' ? '#fff' : colors.text} 
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'privacy' ? '#fff' : colors.text }
            ]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'terms' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveTab('terms')}
          >
            <Ionicons 
              name="document-text" 
              size={18} 
              color={activeTab === 'terms' ? '#fff' : colors.text} 
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'terms' ? '#fff' : colors.text }
            ]}>
              Terms of Service
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'privacy' ? renderPrivacyContent() : renderTermsContent()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold as any,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: Spacing.sm,
    margin: Spacing.base,
    borderRadius: BorderRadius.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  bodyText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    marginBottom: Spacing.base,
  },
  bulletText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    marginBottom: Spacing.base,
    marginLeft: Spacing.sm,
  },
});
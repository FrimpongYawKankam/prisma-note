import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography } from '../../styles/tokens';
import { ModernButton } from '../ui/ModernButton';
import { ModernCard } from '../ui/ModernCard';

interface NeedHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NeedHelpModal: React.FC<NeedHelpModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Need Help?</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Contact Support */}
          <ModernCard style={styles.card} padding="lg">
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Support</Text>
            <Text style={[styles.bodyText, { color: colors.textMuted }]}>
              Having trouble with the app? Send us an email and we'll help you out!
            </Text>

            <ModernButton
              title="Send Email"
              onPress={handleContactSupport}
              variant="gradient"
              size="md"
              leftIcon={<Ionicons name="mail" size={18} color="#fff" />}
            />
          </ModernCard>

          {/* FAQ Section */}
          <ModernCard style={styles.card} padding="lg">
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
            
            <View style={styles.faqItem}>
              <Text style={[styles.question, { color: colors.text }]}>
                🔐 How do I reset my password?
              </Text>
              <Text style={[styles.answer, { color: colors.textMuted }]}>
                On the login screen, tap "Forgot Password?" and enter your email address. You'll receive a verification code to reset your password.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={[styles.question, { color: colors.text }]}>
                ✉️ How do I verify my email?
              </Text>
              <Text style={[styles.answer, { color: colors.textMuted }]}>
                Check your email for a 6-digit verification code after signing up. Enter this code when prompted to verify your account.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={[styles.question, { color: colors.text }]}>
                📱 Can I use this on multiple devices?
              </Text>
              <Text style={[styles.answer, { color: colors.textMuted }]}>
                Yes! Your notes sync automatically when you're logged in. Just sign in with the same account on any device.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={[styles.question, { color: colors.text }]}>
                🔔 How do I set up reminders?
              </Text>
              <Text style={[styles.answer, { color: colors.textMuted }]}>
                When creating or editing a note, tap the reminder icon and choose your preferred date and time.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={[styles.question, { color: colors.text }]}>
                🛡️ Is my data safe?
              </Text>
              <Text style={[styles.answer, { color: colors.textMuted }]}>
                Yes! All your data is encrypted and securely stored. We don't share your personal information with anyone.
              </Text>
            </View>
          </ModernCard>

          {/* Troubleshooting */}
          <ModernCard style={styles.card} padding="lg">
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Common Issues</Text>
            
            <View style={styles.troubleshootItem}>
              <Text style={[styles.troubleshootTitle, { color: colors.text }]}>
                ⚠️ App running slowly?
              </Text>
              <Text style={[styles.troubleshootText, { color: colors.textMuted }]}>
                • Close and restart the app{'\n'}
                • Make sure you have enough storage space{'\n'}
                • Update to the latest version
              </Text>
            </View>

            <View style={styles.troubleshootItem}>
              <Text style={[styles.troubleshootTitle, { color: colors.text }]}>
                📶 Notes not syncing?
              </Text>
              <Text style={[styles.troubleshootText, { color: colors.textMuted }]}>
                • Check your internet connection{'\n'}
                • Log out and log back in{'\n'}
                • Pull down to refresh your notes
              </Text>
            </View>

            <View style={styles.troubleshootItem}>
              <Text style={[styles.troubleshootTitle, { color: colors.text }]}>
                🐛 Found a bug?
              </Text>
              <Text style={[styles.troubleshootText, { color: colors.textMuted }]}>
                Please email us with details about what happened. Include your device model if possible.
              </Text>
            </View>
          </ModernCard>

          {/* App Info */}
          <ModernCard style={styles.card} padding="lg">
            <Text style={[styles.sectionTitle, { color: colors.text }]}>App Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Version:</Text>
              <Text style={[styles.infoValue, { color: colors.textMuted }]}>1.0.0</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Support Email:</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>support@prismanote.com</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Response Time:</Text>
              <Text style={[styles.infoValue, { color: colors.textMuted }]}>Within 24-48 hours</Text>
            </View>
          </ModernCard>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              Thanks for using Prisma Note! 💙{'\n'}
              We're here to help make your note-taking experience great.
            </Text>
          </View>
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
  },
  bodyText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    marginBottom: Spacing.base,
  },
  faqItem: {
    marginBottom: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  question: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginBottom: Spacing.xs,
  },
  answer: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginLeft: Spacing.base,
  },
  troubleshootItem: {
    marginBottom: Spacing.base,
  },
  troubleshootTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.xs,
  },
  troubleshootText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginLeft: Spacing.base,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
  },
  infoValue: {
    fontSize: Typography.fontSize.sm,
  },
  footer: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
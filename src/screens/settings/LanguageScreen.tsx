import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ModernDialog } from '../../components/ui/ModernDialog';
import { useTheme } from '../../context/ThemeContext';

export default function LanguageScreen() {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    isSuccess: false
  });

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', available: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', available: false },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', available: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', available: false },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', available: false },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', available: false },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', available: false },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', available: false },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', available: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', available: false },
  ];

  const showDialog = (title: string, message: string, isSuccess: boolean = false) => {
    setDialogConfig({ title, message, isSuccess });
    setDialogVisible(true);
  };

  const handleLanguageSelect = (languageCode: string, available: boolean) => {
    if (!available) {
      showDialog(
        'Coming Soon',
        'This language is not available yet. We\'re working on adding more language support in future updates.',
        false
      );
      return;
    }
    
    if (languageCode === selectedLanguage) return;
    
    setSelectedLanguage(languageCode);
    showDialog(
      'Language Changed',
      'Language has been updated successfully!',
      true
    );
  };

  const handleDialogClose = () => {
    setDialogVisible(false);
  };

  // For demonstration, only English is available
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Language Info */}
        <View style={[styles.section]}>
          <View style={[styles.currentLanguageCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="language-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.currentLanguageContent}>
              <Text style={[styles.currentLanguageLabel, { color: isDark ? '#aaa' : '#666' }]}>
                Current Language
              </Text>
              <Text style={[styles.currentLanguageName, { color: isDark ? '#fff' : '#000' }]}>
                {languages.find(lang => lang.code === selectedLanguage)?.name || 'English'}
              </Text>
            </View>
            <Text style={styles.currentLanguageFlag}>
              {languages.find(lang => lang.code === selectedLanguage)?.flag || '🇺🇸'}
            </Text>
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Available Languages
          </Text>
          <View style={styles.languageList}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageRow,
                  { 
                    backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
                    opacity: language.available ? 1 : 0.6,
                  }
                ]}
                onPress={() => handleLanguageSelect(language.code, language.available)}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageNames}>
                    <Text style={[styles.languageName, { color: isDark ? '#fff' : '#000' }]}>
                      {language.name}
                    </Text>
                    <Text style={[styles.languageNativeName, { color: isDark ? '#aaa' : '#666' }]}>
                      {language.nativeName}
                    </Text>
                  </View>
                </View>
                <View style={styles.languageStatus}>
                  {!language.available && (
                    <Text style={[styles.comingSoonBadge, { color: isDark ? '#ff9800' : '#f57c00' }]}>
                      Coming Soon
                    </Text>
                  )}
                  {selectedLanguage === language.code && language.available && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                  {selectedLanguage !== language.code && language.available && (
                    <View style={[styles.uncheckedCircle, { borderColor: isDark ? '#444' : '#ccc' }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language Settings Info */}
        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#000' }]}>
                Language Settings
              </Text>
              <Text style={[styles.infoText, { color: isDark ? '#aaa' : '#666' }]}>
                The app language affects the interface text and date/time formats. More languages will be added in future updates.
              </Text>
            </View>
          </View>
        </View>

        {/* Request Language Feature */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.requestCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
            onPress={() => showDialog(
              'Request Language',
              'Feature coming soon! You\'ll be able to request new language support through the feedback system.',
              false
            )}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.requestContent}>
              <Text style={[styles.requestTitle, { color: isDark ? '#fff' : '#000' }]}>
                Request a Language
              </Text>
              <Text style={[styles.requestText, { color: isDark ? '#aaa' : '#666' }]}>
                Don't see your language? Let us know!
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dialog for confirmations and messages */}
      <ModernDialog
        visible={dialogVisible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        buttons={[
          {
            text: 'OK',
            onPress: handleDialogClose,
            style: dialogConfig.isSuccess ? 'default' : 'default'
          }
        ]}
        onClose={handleDialogClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 25,
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentLanguageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
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
  },
  currentLanguageContent: {
    flex: 1,
  },
  currentLanguageLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  currentLanguageName: {
    fontSize: 18,
    fontWeight: '600',
  },
  currentLanguageFlag: {
    fontSize: 28,
  },
  languageList: {
    gap: 8,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageNames: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
    fontWeight: '400',
  },
  languageStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonBadge: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  uncheckedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  requestContent: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  requestText: {
    fontSize: 14,
  },
});

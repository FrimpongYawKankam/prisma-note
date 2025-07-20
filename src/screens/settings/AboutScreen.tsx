import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { safeNavigateBack } from '../../utils/navigation';

export default function AboutScreen() {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header with Back Button and Title */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => safeNavigateBack('/')}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>
            About
          </Text>
        </View>
        
        {/* App Info Section */}
        <View style={styles.section}>
          <View style={[styles.appCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.appIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="document-text-outline" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: isDark ? '#fff' : '#000' }]}>
              PrismaNote
            </Text>
            <Text style={[styles.appVersion, { color: colors.primary }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.appTagline, { color: isDark ? '#aaa' : '#666' }]}>
              Your unified productivity companion
            </Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            About PrismaNote
          </Text>
          <View style={[styles.descriptionCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <Text style={[styles.descriptionText, { color: isDark ? '#fff' : '#000' }]}>
              PrismaNote is designed to end the era of juggling multiple productivity apps. 
              We've created a unified platform that seamlessly integrates note-taking, 
              task management, event scheduling, and essential tools.
            </Text>
            <Text style={[styles.descriptionText, { color: isDark ? '#fff' : '#000' }]}>
              Why switch between 3-4 different apps when you can have everything in one place? 
              PrismaNote brings together all your productivity needs with a beautiful, 
              intuitive interface that adapts to your workflow.
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Key Features
          </Text>
          
          <View style={[styles.featureCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: isDark ? '#fff' : '#000' }]}>
                Smart Note-Taking
              </Text>
              <Text style={[styles.featureText, { color: isDark ? '#aaa' : '#666' }]}>
                Rich text editing with auto-save and intelligent organization
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: isDark ? '#fff' : '#000' }]}>
                Task Management
              </Text>
              <Text style={[styles.featureText, { color: isDark ? '#aaa' : '#666' }]}>
                Daily auto-expiring tasks with smart completion tracking
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: isDark ? '#fff' : '#000' }]}>
                Event Scheduling
              </Text>
              <Text style={[styles.featureText, { color: isDark ? '#aaa' : '#666' }]}>
                Seamless calendar integration with smart notifications
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="calculator-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: isDark ? '#fff' : '#000' }]}>
                Built-in Tools
              </Text>
              <Text style={[styles.featureText, { color: isDark ? '#aaa' : '#666' }]}>
                Calculator and other essential utilities at your fingertips
              </Text>
            </View>
          </View>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Development
          </Text>
          <View style={[styles.developerCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.developerTitle, { color: colors.primary }]}>
              Built with Modern Technology
            </Text>
            <Text style={[styles.developerText, { color: isDark ? '#aaa' : '#666' }]}>
              PrismaNote is built using React Native and Expo, ensuring a smooth, 
              native experience across all platforms. Our backend leverages Spring Boot 
              for robust, scalable performance.
            </Text>
            <View style={styles.techStack}>
              <View style={[styles.techItem, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.techText, { color: colors.primary }]}>React Native</Text>
              </View>
              <View style={[styles.techItem, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.techText, { color: colors.primary }]}>Expo</Text>
              </View>
              <View style={[styles.techItem, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.techText, { color: colors.primary }]}>Spring Boot</Text>
              </View>
              <View style={[styles.techItem, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.techText, { color: colors.primary }]}>Docker</Text>
              </View>
              <View style={[styles.techItem, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.techText, { color: colors.primary }]}>SQL</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
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
  header: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    lineHeight: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  appCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  descriptionCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
  },
  developerCard: {
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
  developerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  developerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  techStack: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  techItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  techText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
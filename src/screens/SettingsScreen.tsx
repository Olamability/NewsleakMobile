import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

type FontSizeMode = 'small' | 'medium' | 'large' | 'extra-large';

const FONT_SIZE_STORAGE_KEY = '@spazr_font_size';

export const SettingsScreen: React.FC = () => {
  const { isDark, themeMode, setThemeMode, colors } = useTheme();
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [fontSize, setFontSizeState] = useState<FontSizeMode>('medium');

  const appVersion = '1.0.0';

  // Load font size preference on mount
  useEffect(() => {
    loadFontSizePreference();
  }, []);

  const loadFontSizePreference = async () => {
    try {
      const savedFontSize = await AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY);
      if (
        savedFontSize === 'small' ||
        savedFontSize === 'medium' ||
        savedFontSize === 'large' ||
        savedFontSize === 'extra-large'
      ) {
        setFontSizeState(savedFontSize);
      }
    } catch (error) {
      console.error('Failed to load font size preference:', error);
    }
  };

  const setFontSize = async (size: FontSizeMode) => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
      setFontSizeState(size);
    } catch (error) {
      console.error('Failed to save font size preference:', error);
    }
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://spazr.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://spazr.com/terms');
  };

  const handlePushNotificationToggle = (value: boolean) => {
    setPushNotificationsEnabled(value);
    // TODO: Implement push notification settings
  };

  const handleThemeModeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleThemeModeChange('light')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="sunny-outline" size={24} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Light Mode</Text>
              </View>
            </View>
            {themeMode === 'light' && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleThemeModeChange('dark')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={24} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
              </View>
            </View>
            {themeMode === 'dark' && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleThemeModeChange('auto')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait-outline" size={24} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Auto (System)</Text>
                <Text style={styles.settingDescription}>Match system theme</Text>
              </View>
            </View>
            {themeMode === 'auto' && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Readability Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Readability</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => setFontSize('small')}>
            <View style={styles.settingLeft}>
              <Ionicons name="text-outline" size={20} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Small Text</Text>
              </View>
            </View>
            {fontSize === 'small' && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setFontSize('medium')}>
            <View style={styles.settingLeft}>
              <Ionicons name="text-outline" size={24} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Medium Text (Default)</Text>
              </View>
            </View>
            {fontSize === 'medium' && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setFontSize('large')}>
            <View style={styles.settingLeft}>
              <Ionicons name="text-outline" size={28} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Large Text</Text>
              </View>
            </View>
            {fontSize === 'large' && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setFontSize('extra-large')}>
            <View style={styles.settingLeft}>
              <Ionicons name="text-outline" size={32} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Extra Large Text</Text>
              </View>
            </View>
            {fontSize === 'extra-large' && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Get notified about breaking news</Text>
              </View>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={handlePushNotificationToggle}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={pushNotificationsEnabled ? COLORS.primary : COLORS.background}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>App Version</Text>
                <Text style={styles.settingDescription}>{appVersion}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleTermsOfService}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Terms of Service</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Spazr News</Text>
          <Text style={styles.footerSubtext}>Your trusted source for news aggregation</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

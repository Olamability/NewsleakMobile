import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminService } from '../services/admin.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { getGlobalScheduler } from '../utils/scheduler';

interface AdminDashboardScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState({
    activeSources: 0,
    totalArticles: 0,
    totalUsers: 0,
    featuredArticles: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const dashboardStats = await AdminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualIngestion = async () => {
    Alert.alert(
      'Trigger Manual Ingestion',
      'This will fetch the latest articles from all active news sources. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Ingestion',
          onPress: async () => {
            try {
              setIsIngesting(true);
              const scheduler = getGlobalScheduler();
              await scheduler.triggerManual();

              // Refresh stats after ingestion
              await loadDashboardStats();

              Alert.alert(
                'Success',
                'Manual ingestion completed! Check the Ingestion Logs for details.'
              );
            } catch (error) {
              console.error('Error during manual ingestion:', error);
              Alert.alert(
                'Error',
                'Failed to complete ingestion. Please check the logs for details.'
              );
            } finally {
              setIsIngesting(false);
            }
          },
        },
      ]
    );
  };

  const adminMenuItems = [
    {
      id: 'sources',
      title: 'Manage News Sources',
      icon: '📰',
      description: 'Enable/disable news sources',
      onPress: () => navigation.navigate('ManageSources'),
    },
    {
      id: 'articles',
      title: 'Manage Articles',
      icon: '📄',
      description: 'Feature or remove articles',
      onPress: () => navigation.navigate('ManageArticles'),
    },
    {
      id: 'logs',
      title: 'Ingestion Logs',
      icon: '📊',
      description: 'Monitor RSS ingestion',
      onPress: () => navigation.navigate('IngestionLogs'),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your news aggregator</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📰</Text>
            <Text style={styles.statValue}>{stats.activeSources}</Text>
            <Text style={styles.statLabel}>Active Sources</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📄</Text>
            <Text style={styles.statValue}>{stats.totalArticles}</Text>
            <Text style={styles.statLabel}>Total Articles</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{stats.featuredArticles}</Text>
            <Text style={styles.statLabel}>Featured</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{stats.totalUsers || '-'}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          {adminMenuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                </View>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingestion</Text>
          <TouchableOpacity
            style={[styles.ingestionButton, isIngesting && styles.ingestionButtonDisabled]}
            onPress={handleManualIngestion}
            disabled={isIngesting}
          >
            <Text style={styles.ingestionButtonIcon}>⚡</Text>
            <View style={styles.ingestionButtonContent}>
              <Text style={styles.ingestionButtonTitle}>
                {isIngesting ? 'Ingesting...' : 'Trigger Manual Ingestion'}
              </Text>
              <Text style={styles.ingestionButtonDescription}>
                {isIngesting
                  ? 'Fetching latest articles from all sources'
                  : 'Fetch latest articles from all active news sources'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Admin actions affect all users. Please use carefully.
          </Text>
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
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.background,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  menuItemTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  menuItemDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  menuItemArrow: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textLight,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: '#856404',
    lineHeight: 20,
  },
  ingestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  ingestionButtonDisabled: {
    opacity: 0.6,
  },
  ingestionButtonIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  ingestionButtonContent: {
    flex: 1,
  },
  ingestionButtonTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.background,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  ingestionButtonDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background,
    opacity: 0.9,
  },
});

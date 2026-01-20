import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { IngestionService } from '../services/ingestion.service';
import { IngestionLog } from '../types';

interface IngestionLogsScreenProps {
  navigation: any;
}

export const IngestionLogsScreen: React.FC<IngestionLogsScreenProps> = ({ navigation }) => {
  const [logs, setLogs] = useState<IngestionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const ingestionService = new IngestionService();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async (isRefresh: boolean = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }

      const fetchedLogs = await ingestionService.getIngestionLogs(50);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadLogs(true);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#28A745';
      case 'error':
        return COLORS.error;
      case 'in_progress':
        return '#FFC107';
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'in_progress':
        return '⏳';
      default:
        return '❓';
    }
  };

  const renderItem = ({ item }: { item: IngestionLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.logHeaderLeft}>
          <Text style={styles.logIcon}>{getStatusIcon(item.status)}</Text>
          <Text style={styles.logSourceName}>{item.source_name}</Text>
        </View>
        <Text style={styles.logTime}>{formatTime(item.created_at)}</Text>
      </View>

      <View style={styles.logDetails}>
        <View style={styles.logDetailItem}>
          <Text style={styles.logDetailLabel}>Status:</Text>
          <Text style={[styles.logDetailValue, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
          </Text>
        </View>

        <View style={styles.logDetailItem}>
          <Text style={styles.logDetailLabel}>Fetched:</Text>
          <Text style={styles.logDetailValue}>{item.articles_fetched}</Text>
        </View>

        <View style={styles.logDetailItem}>
          <Text style={styles.logDetailLabel}>Processed:</Text>
          <Text style={styles.logDetailValue}>{item.articles_processed}</Text>
        </View>

        {item.articles_duplicates > 0 && (
          <View style={styles.logDetailItem}>
            <Text style={styles.logDetailLabel}>Dupes:</Text>
            <Text style={styles.logDetailValue}>{item.articles_duplicates}</Text>
          </View>
        )}
      </View>

      {item.error_message && <Text style={styles.logMessage}>{item.error_message}</Text>}
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (logs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ingestion Logs</Text>
        </View>
        <EmptyState
          icon="📊"
          title="No Logs Found"
          message="RSS ingestion logs will appear here"
          actionLabel="Refresh"
          onAction={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ingestion Logs</Text>
        <Text style={styles.headerSubtitle}>Monitor RSS feed ingestion</Text>
      </View>

      <FlatList
        data={logs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: SPACING.lg,
  },
  logCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  logSourceName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  logTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  logDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  logDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logDetailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  logDetailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  logMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});

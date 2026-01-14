import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Switch,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface NewsSource {
  id: string;
  name: string;
  website_url: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

interface ManageSourcesScreenProps {
  navigation: any;
}

export const ManageSourcesScreen: React.FC<ManageSourcesScreenProps> = ({ navigation }) => {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async (isRefresh: boolean = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }
      // TODO: Implement actual API call to fetch sources
      // For now, using placeholder data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockSources: NewsSource[] = [
        {
          id: '1',
          name: 'BBC News',
          website_url: 'https://bbc.com',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'CNN',
          website_url: 'https://cnn.com',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'The Punch',
          website_url: 'https://punchng.com',
          is_active: false,
          created_at: new Date().toISOString(),
        },
      ];
      setSources(mockSources);
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleToggleSource = async (sourceId: string, currentState: boolean) => {
    try {
      // TODO: Implement actual API call to toggle source
      setSources(prevSources =>
        prevSources.map(source =>
          source.id === sourceId ? { ...source, is_active: !currentState } : source
        )
      );
    } catch (error) {
      console.error('Error toggling source:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSources(true);
  };

  const renderItem = ({ item }: { item: NewsSource }) => (
    <View style={styles.sourceCard}>
      <View style={styles.sourceInfo}>
        <Text style={styles.sourceName}>{item.name}</Text>
        <Text style={styles.sourceUrl}>{item.website_url}</Text>
      </View>
      <View style={styles.sourceActions}>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, item.is_active && styles.activeText]}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
          <Switch
            value={item.is_active}
            onValueChange={() => handleToggleSource(item.id, item.is_active)}
            trackColor={{ false: COLORS.textLight, true: COLORS.primary }}
            thumbColor={COLORS.background}
          />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (sources.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Sources</Text>
        </View>
        <EmptyState
          icon="📰"
          title="No Sources Found"
          message="Add news sources to start aggregating content"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Sources</Text>
        <Text style={styles.headerSubtitle}>{sources.length} total sources</Text>
      </View>

      <FlatList
        data={sources}
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
  sourceCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sourceUrl: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  sourceActions: {
    marginLeft: SPACING.md,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  activeText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

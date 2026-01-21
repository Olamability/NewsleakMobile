import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { AdminService } from '../services/admin.service';
import { NewsSource } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

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
      const fetchedSources = await AdminService.getAllSources();
      setSources(fetchedSources);
    } catch (error) {
      console.error('Error loading sources:', error);
      Alert.alert('Error', 'Failed to load sources. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleToggleSource = async (sourceId: string, currentState: boolean) => {
    try {
      const newState = !currentState;
      const response = await AdminService.toggleSourceStatus(sourceId, newState);

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      setSources((prevSources) =>
        prevSources.map((source) =>
          source.id === sourceId ? { ...source, is_active: newState } : source
        )
      );
    } catch (error) {
      console.error('Error toggling source:', error);
      Alert.alert('Error', 'Failed to update source status. Please try again.');
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

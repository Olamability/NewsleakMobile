import React, { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NotificationItem } from '../components/NotificationItem';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useTrackEvent } from '../lib/queries';
import { RootStackParamList } from '../navigation/types';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

interface NotificationsScreenProps {
  navigation: NotificationsScreenNavigationProp;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  article_id?: string;
  created_at: string;
  read: boolean;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation: _navigation,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { mutate: trackEvent } = useTrackEvent();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // TODO: Implement notification fetching
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      trackEvent({
        eventType: 'notification_tap',
        metadata: { notification_id: notification.id },
      });

      if (notification.article_id) {
        // TODO: Fetch article and navigate
        // navigation.navigate('ArticleDetail', { article });
      }
    },
    [trackEvent]
  );

  if (isLoading && notifications.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No Notifications"
          message="You don't have any notifications yet. We'll notify you when there's breaking news!"
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              title={item.title}
              body={item.body}
              timestamp={item.created_at}
              isRead={item.read}
              onPress={() => handleNotificationPress(item)}
            />
          )}
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
      )}
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
  listContent: {
    paddingVertical: SPACING.sm,
  },
});

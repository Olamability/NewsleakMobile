import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { timeAgo } from '../lib/helpers';
import { useArticle, useTrackEvent } from '../lib/queries';
import { RootStackParamList } from '../navigation/types';

type ArticleDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ArticleDetail'
>;
type ArticleDetailScreenRouteProp = RouteProp<RootStackParamList, 'ArticleDetail'>;

interface ArticleDetailScreenProps {
  navigation: ArticleDetailScreenNavigationProp;
  route: ArticleDetailScreenRouteProp;
}

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({ navigation, route }) => {
  const { articleId } = route.params;
  const { data: article, isLoading, error } = useArticle(articleId);
  const [imageError, setImageError] = useState(false);
  const { mutate: trackEvent } = useTrackEvent();

  useEffect(() => {
    if (article) {
      trackEvent({
        eventType: 'article_view',
        articleId: article.id,
        metadata: { source: article.news_sources?.name },
      });
    }
  }, [article?.id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load article</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleReadFullStory = async () => {
    try {
      trackEvent({
        eventType: 'article_external_view',
        articleId: article.id,
      });
      await WebBrowser.openBrowserAsync(article.original_url);
    } catch (error) {
      console.error('Error opening browser:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Article Image */}
        {!imageError && article.image_url ? (
          <Image
            source={{ uri: article.image_url }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="newspaper-outline" size={80} color={COLORS.textLight} />
          </View>
        )}

        {/* Article Content */}
        <View style={styles.content}>
          {/* Source & Time */}
          <View style={styles.metaContainer}>
            {article.news_sources && (
              <View style={styles.sourceRow}>
                <Text style={styles.sourceName}>{article.news_sources.name}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.publishedTime}>{timeAgo(article.published_at)} ago</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Summary */}
          {article.summary && (
            <Text style={styles.summary}>{article.summary}</Text>
          )}

          {/* Read Full Story Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.readButton}
              onPress={handleReadFullStory}
              activeOpacity={0.8}
            >
              <Text style={styles.readButtonText}>
                Read Full Story at {article.news_sources?.name || 'Source'}
              </Text>
              <Ionicons name="open-outline" size={20} color={COLORS.background} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.backgroundSecondary,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  metaContainer: {
    marginBottom: SPACING.md,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dot: {
    marginHorizontal: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  publishedTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 36,
    marginBottom: SPACING.md,
  },
  summary: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    lineHeight: 28,
    marginBottom: SPACING.xl,
  },
  actionContainer: {
    marginTop: SPACING.lg,
  },
  readButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  readButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
  },
});

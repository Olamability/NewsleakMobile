import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { NewsArticle } from '../types/news';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { formatFullDate, extractDomain } from '../utils/helpers';
import { Button } from '../components/Button';
import { useTrackEvent } from '../lib/queries';
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
  const { article } = route.params;
  const [imageError, setImageError] = useState(false);
  const { mutate: trackEvent } = useTrackEvent();

  useEffect(() => {
    trackEvent({
      eventType: 'article_view',
      articleId: article.id,
      metadata: { source: article.news_sources?.name },
    });
  }, [article.id, trackEvent]);

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
                <Text style={styles.publishedTime}>{formatFullDate(article.published_at)}</Text>
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
            <Button
              title={`Read Full Story at ${article.news_sources?.name || extractDomain(article.original_url)}`}
              onPress={handleReadFullStory}
              variant="primary"
            />
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
});

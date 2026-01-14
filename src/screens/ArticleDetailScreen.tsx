import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
} from 'react-native';
import { NewsArticle } from '../types';
import { NewsService } from '../services/news.service';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { getCategoryColor } from '../constants/categories';

interface ArticleDetailScreenProps {
  route: any;
  navigation: any;
}

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { article } = route.params as { article: NewsArticle };
  const categoryColor = getCategoryColor(article.category);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReadFullArticle = () => {
    const trackingUrl = NewsService.generateTrackingUrl(article.article_url);
    NewsService.incrementViewCount(article.id);
    navigation.navigate('ArticleWebView', {
      url: trackingUrl,
      title: article.title,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.article_url}`,
        url: article.article_url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: article.image_url }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>

          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.metadata}>
            <Text style={styles.source}>{article.source_name}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>{formatDate(article.published_at)}</Text>
          </View>

          <Text style={styles.summary}>{article.summary}</Text>

          {article.content_snippet && (
            <Text style={styles.snippet}>{article.content_snippet}</Text>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.readButton}
              onPress={handleReadFullArticle}
            >
              <Text style={styles.readButtonText}>📖 Read Full Article</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Text style={styles.shareButtonText}>🔗 Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              📌 This article is hosted on {article.source_name}. Tapping "Read Full Article"
              will redirect you to their website.
            </Text>
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
  image: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  categoryText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 40,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  source: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dot: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginHorizontal: SPACING.sm,
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  summary: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: SPACING.lg,
    fontWeight: '500',
  },
  snippet: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    flexDirection: 'column',
    marginBottom: SPACING.xl,
  },
  readButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  readButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  shareButton: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  disclaimerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

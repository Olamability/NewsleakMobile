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
  useWindowDimensions,
  Linking,
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
  const { width: windowWidth } = useWindowDimensions();
  const imageHeight = Math.min(300, windowWidth * 0.6);

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

  const handleReadFullArticle = async () => {
    const trackingUrl = NewsService.generateTrackingUrl(article.article_url);
    NewsService.incrementViewCount(article.id);
    
    try {
      const supported = await Linking.canOpenURL(trackingUrl);
      if (supported) {
        await Linking.openURL(trackingUrl);
      } else {
        console.error("Cannot open URL:", trackingUrl);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      // Fallback to WebView navigation
      navigation.navigate('ArticleWebView', {
        url: trackingUrl,
        title: article.title,
      });
    }
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
        {article.image_url ? (
          <Image
            source={{ uri: article.image_url }}
            style={[styles.image, { height: imageHeight }]}
            resizeMode="cover"
            defaultSource={require('../../assets/icon.png')}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { height: imageHeight }]}>
            <Text style={styles.placeholderIcon}>📰</Text>
          </View>
        )}

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

          <View style={styles.summaryCard}>
            <Text style={styles.summary}>{article.summary}</Text>
          </View>

          {article.content_snippet && (
            <View style={styles.contentCard}>
              <Text style={styles.contentLabel}>News Preview</Text>
              <Text style={styles.snippet}>{article.content_snippet}</Text>
              
              <TouchableOpacity
                style={styles.readFullLink}
                onPress={handleReadFullArticle}
              >
                <Text style={styles.readFullLinkText}>
                  📖 Read Full Article at {article.source_name} →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!article.content_snippet && (
            <TouchableOpacity
              style={styles.readButton}
              onPress={handleReadFullArticle}
            >
              <Text style={styles.readButtonText}>📖 Read Full Article</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Text style={styles.shareButtonText}>🔗 Share Article</Text>
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              📌 This article is from {article.source_name}. You will be redirected to their website to read the complete article.
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
    backgroundColor: COLORS.backgroundSecondary,
  },
  imagePlaceholder: {
    width: '100%',
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
    opacity: 0.3,
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
    lineHeight: 36,
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
  summaryCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  summary: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    lineHeight: 26,
    fontWeight: '500',
  },
  contentCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  contentLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  snippet: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  readFullLink: {
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  readFullLinkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    textAlign: 'center',
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
    marginBottom: SPACING.xl,
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

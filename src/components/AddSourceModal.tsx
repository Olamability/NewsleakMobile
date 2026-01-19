import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

// Common RSS feed URL patterns
const RSS_FEED_PATTERNS = [
  '/rss',
  '/feed',
  '.xml',
  '.rss',
  'rss.xml',
  'feed.xml',
];

interface AddSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, rssUrl: string, websiteUrl: string) => Promise<void>;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [rssUrl, setRssUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !rssUrl.trim()) {
      Alert.alert('Error', 'Please fill in source name and RSS URL');
      return;
    }

    // Basic URL validation
    try {
      const rssUrlObj = new URL(rssUrl.trim());
      // Check if URL looks like an RSS feed
      const rssUrlLower = rssUrl.toLowerCase();
      const isLikelyRssFeed = RSS_FEED_PATTERNS.some(pattern => 
        rssUrlLower.includes(pattern)
      );
      
      if (!isLikelyRssFeed) {
        Alert.alert(
          'Warning',
          `The URL does not appear to be an RSS feed. RSS URLs typically contain ${RSS_FEED_PATTERNS.slice(0, 2).join(', ')} or end with ${RSS_FEED_PATTERNS[2]}. Do you want to continue?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Continue', 
              onPress: async () => await addSource()
            }
          ]
        );
        return;
      }

      if (websiteUrl.trim()) {
        new URL(websiteUrl.trim());
      }
    } catch (urlError) {
      Alert.alert('Error', 'Please enter valid URLs');
      return;
    }

    await addSource();
  };

  const addSource = async () => {
    try {
      setIsLoading(true);
      await onAdd(name.trim(), rssUrl.trim(), websiteUrl.trim());
      setName('');
      setRssUrl('');
      setWebsiteUrl('');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add news source';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Add News Source</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Source Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., BBC News"
              placeholderTextColor={COLORS.textPlaceholder}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />

            <Text style={styles.label}>RSS Feed URL *</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/rss"
              placeholderTextColor={COLORS.textPlaceholder}
              value={rssUrl}
              onChangeText={setRssUrl}
              autoCapitalize="none"
              keyboardType="url"
              editable={!isLoading}
            />

            <Text style={styles.label}>Website URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com"
              placeholderTextColor={COLORS.textPlaceholder}
              value={websiteUrl}
              onChangeText={setWebsiteUrl}
              autoCapitalize="none"
              keyboardType="url"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={styles.submitButtonText}>Add Source</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeIcon: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});

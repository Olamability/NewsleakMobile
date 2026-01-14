import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

interface CategoryListScreenProps {
  navigation: any;
}

export const CategoryListScreen: React.FC<CategoryListScreenProps> = ({ navigation }) => {
  const handleCategoryPress = (slug: string, name: string) => {
    navigation.navigate('CategoryFeed', { category: slug, categoryName: name });
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => handleCategoryPress(item.slug, item.name)}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <Text style={styles.headerSubtitle}>Explore news by topic</Text>
      </View>
      <FlatList
        data={CATEGORIES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
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
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    height: 140,
    margin: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  icon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.background,
    textAlign: 'center',
  },
});

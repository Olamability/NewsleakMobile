// News categories based on PRD requirements

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  {
    id: '2',
    name: 'Breaking',
    slug: 'breaking',
    color: '#E81E24',
    icon: '🚨',
  },
  {
    id: '1',
    name: 'Top Stories',
    slug: 'top-stories',
    color: '#E81E24',
    icon: '⭐',
  },
  {
    id: '3',
    name: 'Politics',
    slug: 'politics',
    color: '#E81E24',
    icon: '🏛️',
  },
  {
    id: '4',
    name: 'Business',
    slug: 'business',
    color: '#2196F3',
    icon: '💼',
  },
  {
    id: '5',
    name: 'Sports',
    slug: 'sports',
    color: '#4CAF50',
    icon: '⚽',
  },
  {
    id: '6',
    name: 'Technology',
    slug: 'technology',
    color: '#44B8FF',
    icon: '💻',
  },
  {
    id: '7',
    name: 'Entertainment',
    slug: 'entertainment',
    color: '#FF5722',
    icon: '🎬',
  },
  {
    id: '8',
    name: 'Health',
    slug: 'health',
    color: '#00BCD4',
    icon: '🏥',
  },
  {
    id: '9',
    name: 'Lifestyle',
    slug: 'lifestyle',
    color: '#FF9800',
    icon: '✨',
  },
  {
    id: '10',
    name: 'Environment',
    slug: 'environment',
    color: '#44B8FF',
    icon: '🌍',
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.slug === slug);
};

export const getCategoryColor = (slug: string): string => {
  const category = getCategoryBySlug(slug);
  return category?.color || '#6b7280';
};

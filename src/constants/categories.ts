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
    id: '1',
    name: 'Top Stories',
    slug: 'top-stories',
    color: '#2563eb',
    icon: '📰',
  },
  {
    id: '2',
    name: 'Breaking News',
    slug: 'breaking',
    color: '#ef4444',
    icon: '🚨',
  },
  {
    id: '3',
    name: 'Politics',
    slug: 'politics',
    color: '#dc2626',
    icon: '🏛️',
  },
  {
    id: '4',
    name: 'Business',
    slug: 'business',
    color: '#7c3aed',
    icon: '💼',
  },
  {
    id: '5',
    name: 'Sports',
    slug: 'sports',
    color: '#059669',
    icon: '⚽',
  },
  {
    id: '6',
    name: 'Technology',
    slug: 'technology',
    color: '#0284c7',
    icon: '💻',
  },
  {
    id: '7',
    name: 'Entertainment',
    slug: 'entertainment',
    color: '#db2777',
    icon: '🎬',
  },
  {
    id: '8',
    name: 'Health',
    slug: 'health',
    color: '#16a34a',
    icon: '🏥',
  },
  {
    id: '9',
    name: 'Lifestyle',
    slug: 'lifestyle',
    color: '#ea580c',
    icon: '✨',
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.slug === slug);
};

export const getCategoryColor = (slug: string): string => {
  const category = getCategoryBySlug(slug);
  return category?.color || '#6b7280';
};

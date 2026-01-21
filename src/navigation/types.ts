import { NewsArticle } from '../types/news';

export type RootStackParamList = {
  Main: undefined;
  ArticleDetail: { articleId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
};

import { NewsArticle } from '../types';

export type RootStackParamList = {
  Main: undefined;
  ArticleDetail: { article: NewsArticle };
  ArticleWebView: { url: string; title: string };
  Auth: undefined;
  SignIn: undefined;
  SignUp: undefined;
  AdminDashboard: undefined;
  ManageSources: undefined;
  ManageArticles: undefined;
  IngestionLogs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Search: undefined;
  Notifications: undefined;
  Settings: undefined;
  Bookmarks: undefined;
  Profile: undefined;
};

export type CategoryStackParamList = {
  CategoryList: undefined;
  CategoryFeed: { category: string; categoryName: string };
};

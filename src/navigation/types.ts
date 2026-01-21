import { NewsArticle } from '../types/news';

export type RootStackParamList = {
  Main: undefined;
  ArticleDetail: { articleId: string };
  SignIn: undefined;
  SignUp: undefined;
  Auth: undefined;
  AdminDashboard: undefined;
  ManageSources: undefined;
  ManageArticles: undefined;
  IngestionLogs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
};

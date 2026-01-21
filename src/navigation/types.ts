export type RootStackParamList = {
  Main: undefined;
  Search: undefined;
  ArticleDetail: { articleId: string };
  ArticleWebView: { url: string; title?: string };
  CategoryFeed: { category: string; categoryName: string };
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
  Bookmarks: undefined;
  Profile: undefined;
  Settings: undefined;
};

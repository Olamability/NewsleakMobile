# Spazr News Aggregator Mobile App

A modern, production-ready React Native Expo news aggregator app with Supabase backend integration. This app curates real-time news from trusted sources and provides a sleek, mobile-first reading experience.

## 📚 Quick Links

- **👤 [USER GUIDE](./USER_GUIDE.md)** - **Start here!** Learn how to access admin features and add RSS feeds
- **⚡ [Quick Start](./QUICKSTART.md)** - Get the app running in 5 minutes
- **🚀 [Getting Started](./GETTING_STARTED.md)** - Complete setup with sample data (10 minutes)
- **📰 [RSS Feeds Guide](./RSS_FEEDS_GUIDE.md)** - Comprehensive RSS feed management
- **🔧 [Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🎯 Features

### Core Features
- **News Aggregation**: Real-time news from multiple trusted sources
- **Category-based Navigation**: Browse news by Politics, Sports, Business, Technology, Entertainment, Health, and Lifestyle
- **Search Functionality**: Search for articles by keywords
- **Bookmarking**: Save articles for later reading (authenticated users)
- **Article Preview**: Clean preview with source attribution
- **External Reading**: Redirect to original publishers with UTM tracking
- **Pull-to-Refresh**: Refresh news feed with pull gesture
- **Infinite Scroll**: Pagination for improved performance

### Authentication
- **User Registration**: Sign up with email and password
- **Secure Sign In**: JWT-based authentication
- **Profile Management**: View and manage user profile
- **Secure Storage**: Authentication tokens stored securely using Expo SecureStore

### UI/UX
- **Sleek Design**: Modern, consistent design system
- **Responsive Layout**: Optimized for various screen sizes
- **Loading States**: Skeleton screens and loading indicators
- **Empty States**: Helpful empty state messages
- **Error Handling**: Graceful error handling with retry options

## 📱 Screenshots

[Screenshots will be added after first run]

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── NewsCard.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── ErrorState.tsx
├── screens/            # App screens
│   ├── HomeScreen.tsx
│   ├── CategoryListScreen.tsx
│   ├── CategoryFeedScreen.tsx
│   ├── SearchScreen.tsx
│   ├── BookmarksScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── ArticleDetailScreen.tsx
│   ├── ArticleWebViewScreen.tsx
│   ├── SignInScreen.tsx
│   ├── SignUpScreen.tsx
│   └── SplashScreen.tsx
├── services/           # API services
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── news.service.ts
│   └── bookmark.service.ts
├── context/            # Global state management
│   └── AuthContext.tsx
├── navigation/         # Navigation setup
│   ├── AppNavigator.tsx
│   └── types.ts
├── constants/          # App constants
│   ├── theme.ts
│   └── categories.ts
├── types/             # TypeScript types
│   └── index.ts
└── utils/             # Utility functions
```

### Tech Stack

**Frontend:**
- React Native (Expo)
- TypeScript
- React Navigation (Stack & Bottom Tabs)
- React Context API (State Management)

**Backend:**
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage

**Key Libraries:**
- `@supabase/supabase-js` - Supabase client
- `@react-navigation/native` - Navigation
- `expo-secure-store` - Secure token storage
- `react-native-webview` - In-app browser
- `axios` - HTTP client

## 🚀 Getting Started

**⚡ Quick Start:** See [GETTING_STARTED.md](./GETTING_STARTED.md) for a detailed step-by-step guide to get the app running with sample data in under 10 minutes.

### Prerequisites
- Node.js 16+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio
- Supabase account (free tier works fine)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Olamability/NewsleakMobile.git
cd NewsleakMobile  # Project root (repository name unchanged)
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

#### 1. Create Tables

Run the SQL file in your Supabase SQL editor:
- Copy contents of `/supabase/schema.sql` and run it

This creates all tables and seeds categories and news sources.

#### 2. Add Sample Articles (Important!)

To see articles immediately without waiting for RSS ingestion:
- Copy contents of `/supabase/sample-articles.sql` and run it

This adds 20+ sample articles across all categories for testing.

**Note:** Without sample articles, the app will show "No articles found" because the database tables will be empty.

#### 3. Original SQL Reference

For reference, here's the table structure:

```sql
-- News Articles Table
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT,
  summary TEXT NOT NULL,
  content_snippet TEXT,
  image_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  article_url TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  language TEXT DEFAULT 'en',
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0
);

-- News Sources Table
CREATE TABLE news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  rss_url TEXT,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks Table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Create indexes for better performance
CREATE INDEX idx_news_articles_category ON news_articles(category);
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_view_count ON news_articles(view_count DESC);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_article_id ON bookmarks(article_id);
```

#### 2. Set up Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Public read access for articles
CREATE POLICY "Public can view articles" ON news_articles
  FOR SELECT USING (true);

-- Users can manage their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

### Running the App

**Start the development server:**
```bash
npm start
```

**Run on specific platforms:**
```bash
npm run android    # Android
npm run ios        # iOS (Mac only)
npm run web        # Web
```

## 🔐 Security

- **Authentication**: JWT-based authentication via Supabase Auth
- **Token Storage**: Secure token storage using Expo SecureStore
- **Row Level Security**: PostgreSQL RLS policies for data protection
- **Environment Variables**: Sensitive data stored in environment variables
- **Input Validation**: Client-side and server-side validation

## 📊 Database Schema

### news_articles
- `id` (UUID, Primary Key)
- `title` (Text, Required)
- `summary` (Text, Required)
- `image_url` (Text, Required)
- `source_name` (Text, Required)
- `article_url` (Text, Required)
- `category` (Text, Required)
- `published_at` (Timestamp, Required)
- `view_count` (Integer, Default: 0)

### bookmarks
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `article_id` (UUID, Foreign Key → news_articles)
- `created_at` (Timestamp)

## 🎨 Design System

The app uses a consistent design system defined in `src/constants/theme.ts`:

- **Colors**: Primary, secondary, text, background, status colors
- **Typography**: Font sizes from xs (12px) to xxxl (32px)
- **Spacing**: Consistent spacing scale (xs: 4px to xxl: 48px)
- **Border Radius**: sm, md, lg, xl, round
- **Shadows**: sm, md, lg with platform-specific implementations

## 🔄 State Management

Global state is managed using React Context API:
- **AuthContext**: Manages authentication state and user information

## 📱 Navigation Structure

```
Root Stack
├── Main Tab Navigator
│   ├── Home (Stack)
│   ├── Categories (Stack)
│   │   ├── CategoryList
│   │   └── CategoryFeed
│   ├── Search
│   ├── Bookmarks
│   └── Profile
├── ArticleDetail (Modal)
├── ArticleWebView (Modal)
├── SignIn (Modal)
└── SignUp (Modal)
```

## 🚦 API Endpoints (Supabase)

All API calls are handled through Supabase client:
- `GET /news_articles` - Fetch paginated articles
- `GET /news_articles?category=politics` - Filter by category
- `GET /news_articles (search)` - Search articles
- `POST /bookmarks` - Add bookmark
- `DELETE /bookmarks` - Remove bookmark

## 📈 Performance Optimizations

- **FlatList Virtualization**: Efficient rendering of large lists
- **Image Caching**: Automatic image caching
- **Pagination**: Load more data on scroll
- **Memoization**: React.memo and useMemo for expensive computations
- **Code Splitting**: Lazy loading of screens

## 🧪 Testing

Run tests with:
```bash
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
```

## 🐛 Troubleshooting

For common issues and solutions, see:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - General troubleshooting guide
- [WINDOWS_ESM_FIX.md](./WINDOWS_ESM_FIX.md) - Windows-specific Metro ESM URL scheme error fix

## 📦 Build & Deployment

### Build for Android
```bash
eas build --platform android
```

### Build for iOS
```bash
eas build --platform ios
```

### Submit to Stores
```bash
eas submit --platform android
eas submit --platform ios
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

- Ability - Initial development

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@spazr.com.ng or create an issue in this repository.

## 🙏 Acknowledgments

- PRD documents in `/PRD` directory
- Supabase for backend infrastructure
- Expo team for amazing developer experience
- React Native community

---

Built with ❤️ using React Native Expo and Supabase

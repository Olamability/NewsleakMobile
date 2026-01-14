# Configuration Guide

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create an account if you don't have one
2. Click "New Project"
3. Fill in the project details:
   - Project name: `spazr-news` (or your preferred name)
   - Database password: (set a strong password)
   - Region: Choose closest to your users
4. Click "Create new project"

### Step 2: Get Your API Credentials

1. Once your project is created, go to Project Settings > API
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (a long JWT token)
3. Add these to your `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Create Database Tables

1. Go to SQL Editor in your Supabase dashboard
2. Create a new query and paste the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  article_url TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  tags TEXT[],
  language TEXT DEFAULT 'en',
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0
);

-- News Sources Table
CREATE TABLE news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  rss_url TEXT,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX idx_news_articles_article_url ON news_articles(article_url);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_article_id ON bookmarks(article_id);
CREATE INDEX idx_news_sources_is_active ON news_sources(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON news_articles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_sources_updated_at BEFORE UPDATE ON news_sources 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. Click "Run" to execute the SQL

### Step 4: Set up Row Level Security (RLS)

1. In SQL Editor, create a new query and paste:

```sql
-- Enable RLS
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Public read access for articles
CREATE POLICY "Public can view articles" ON news_articles
  FOR SELECT USING (true);

-- Public read access for sources
CREATE POLICY "Public can view sources" ON news_sources
  FOR SELECT USING (is_active = true);

-- Users can manage their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

2. Click "Run" to execute

### Step 5: Add Sample Data (Optional for Testing)

```sql
-- Insert sample news sources
INSERT INTO news_sources (name, website_url, logo_url, is_active) VALUES
('BBC News', 'https://www.bbc.com/news', 'https://via.placeholder.com/100', true),
('CNN', 'https://www.cnn.com', 'https://via.placeholder.com/100', true),
('TechCrunch', 'https://techcrunch.com', 'https://via.placeholder.com/100', true);

-- Insert sample news articles
INSERT INTO news_articles (
  title, 
  summary, 
  image_url, 
  source_name, 
  source_url, 
  article_url, 
  category, 
  published_at
) VALUES
(
  'Breaking: Major Tech Announcement',
  'A major technology company has announced a groundbreaking new product that could change the industry.',
  'https://via.placeholder.com/800x400',
  'TechCrunch',
  'https://techcrunch.com',
  'https://techcrunch.com/article-1',
  'technology',
  NOW() - INTERVAL '2 hours'
),
(
  'Sports: Championship Final Results',
  'The championship final concluded with an unexpected winner after an intense match.',
  'https://via.placeholder.com/800x400',
  'ESPN',
  'https://espn.com',
  'https://espn.com/article-1',
  'sports',
  NOW() - INTERVAL '4 hours'
),
(
  'Business: Market Update',
  'Stock markets showed mixed results today as investors react to new economic data.',
  'https://via.placeholder.com/800x400',
  'Bloomberg',
  'https://bloomberg.com',
  'https://bloomberg.com/article-1',
  'business',
  NOW() - INTERVAL '6 hours'
);
```

### Step 6: Configure Authentication

1. Go to Authentication > Settings in Supabase dashboard
2. Enable Email Auth:
   - Enable "Enable Email provider"
   - Configure email templates (optional)
3. For production, configure custom SMTP settings for email delivery

### Step 7: Test Your Setup

1. Update your `.env` file with the credentials
2. Run the app: `npm start`
3. Test the following:
   - View news articles (should work without authentication)
   - Sign up for a new account
   - Sign in
   - Add bookmarks
   - Search articles

## Environment Variables

Make sure your `.env` file contains:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_APP_NAME=Spazr News
EXPO_PUBLIC_UTM_SOURCE=spazr_app
EXPO_PUBLIC_UTM_MEDIUM=referral
EXPO_PUBLIC_UTM_CAMPAIGN=news_aggregation
```

## Production Checklist

Before deploying to production:

- [ ] Update `.env` with production Supabase credentials
- [ ] Enable email verification in Supabase Auth settings
- [ ] Set up custom email templates
- [ ] Configure SMTP for production emails
- [ ] Set up a news ingestion system (RSS parser, cron jobs)
- [ ] Add more sample data or connect to real news sources
- [ ] Test all features thoroughly
- [ ] Set up analytics (Firebase, etc.)
- [ ] Configure push notifications
- [ ] Add privacy policy and terms of service
- [ ] Generate app icons and splash screens
- [ ] Test on both iOS and Android
- [ ] Set up CI/CD pipeline
- [ ] Configure app signing for stores

## Troubleshooting

### Connection Issues
- Verify Supabase URL and anon key are correct
- Check if Supabase project is active
- Ensure internet connection is stable

### Authentication Issues
- Verify RLS policies are correctly set up
- Check email verification settings
- Ensure auth.users table exists

### Data Not Loading
- Check if tables are created correctly
- Verify RLS policies allow public read access for news_articles
- Check browser/app console for error messages

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Review error messages in app console
3. Verify all SQL queries executed successfully
4. Ensure environment variables are loaded correctly

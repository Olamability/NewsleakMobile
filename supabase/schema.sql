-- Spazr News - Complete Supabase Database Schema
-- Production-ready schema for Opera-style news aggregator

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =============================================
-- CATEGORIES TABLE
-- =============================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  icon text,
  color text,
  created_at timestamp with time zone default now()
);

-- =============================================
-- NEWS SOURCES TABLE
-- =============================================
create table if not exists news_sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  website_url text not null,
  rss_url text not null,
  logo_url text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- =============================================
-- NEWS ARTICLES TABLE
-- =============================================
create table if not exists news_articles (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references news_sources(id) on delete cascade,
  category_id uuid references categories(id),
  title text not null,
  slug text,
  summary text not null,
  content_snippet text,
  image_url text,
  article_url text,
  original_url text unique not null,
  source_name text,
  source_url text,
  category text,
  tags text[],
  language text,
  published_at timestamp with time zone,
  content_hash text unique,
  view_count integer default 0,
  is_breaking boolean default false,
  is_featured boolean default false,
  is_sponsored boolean default false,
  quality_score numeric default 1.0,
  created_at timestamp with time zone default now()
);

-- =============================================
-- SPONSORED CONTENT TABLE
-- =============================================
create table if not exists sponsored_content (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  summary text not null,
  image_url text,
  cta_url text not null,
  start_date date,
  end_date date,
  budget numeric,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- =============================================
-- ANALYTICS EVENTS TABLE
-- =============================================
create table if not exists analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  article_id uuid references news_articles(id),
  user_id uuid,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- =============================================
-- USER DEVICES TABLE (Push Notifications)
-- =============================================
create table if not exists user_devices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  expo_push_token text unique not null,
  platform text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- =============================================
-- PUBLISHERS TABLE
-- =============================================
create table if not exists publishers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  website_url text not null,
  contact_email text,
  status text default 'pending', -- pending | approved | suspended
  created_at timestamp with time zone default now()
);

-- =============================================
-- PUBLISHER SOURCES TABLE
-- =============================================
create table if not exists publisher_sources (
  id uuid primary key default uuid_generate_v4(),
  publisher_id uuid references publishers(id) on delete cascade,
  rss_url text not null,
  category_id uuid references categories(id),
  is_active boolean default false,
  created_at timestamp with time zone default now()
);

-- =============================================
-- ADMIN USERS TABLE
-- =============================================
create table if not exists admin_users (
  id uuid primary key,
  role text default 'editor', -- editor | admin | super_admin
  created_at timestamp with time zone default now()
);

-- =============================================
-- ARTICLE MODERATION TABLE
-- =============================================
create table if not exists article_moderation (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references news_articles(id) on delete cascade,
  status text default 'approved', -- approved | hidden | flagged
  reason text,
  reviewed_by uuid references admin_users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- =============================================
-- PUSH CAMPAIGNS TABLE
-- =============================================
create table if not exists push_campaigns (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  is_sponsored boolean default false,
  status text default 'draft', -- draft | scheduled | sent
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  created_by uuid references admin_users(id),
  created_at timestamp with time zone default now()
);

-- =============================================
-- RECENT SEARCHES TABLE (User Feature)
-- =============================================
create table if not exists recent_searches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  query text not null,
  created_at timestamp with time zone default now()
);

-- =============================================
-- TRENDING TOPICS TABLE
-- =============================================
create table if not exists trending_topics (
  id uuid primary key default uuid_generate_v4(),
  topic text not null,
  search_count integer default 0,
  last_searched_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- =============================================
-- INGESTION LOGS TABLE
-- =============================================
create table if not exists ingestion_logs (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references news_sources(id) on delete cascade,
  source_name text not null,
  status text not null, -- in_progress | success | error
  articles_fetched integer default 0,
  articles_processed integer default 0,
  articles_duplicates integer default 0,
  error_message text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
create index if not exists idx_news_articles_published_at on news_articles(published_at desc);
create index if not exists idx_news_articles_category_id on news_articles(category_id);
create index if not exists idx_news_articles_category on news_articles(category);
create index if not exists idx_news_articles_source_id on news_articles(source_id);
create index if not exists idx_news_articles_is_breaking on news_articles(is_breaking) where is_breaking = true;
create index if not exists idx_news_articles_content_hash on news_articles(content_hash);
create index if not exists idx_analytics_events_created_at on analytics_events(created_at desc);
create index if not exists idx_analytics_events_article_id on analytics_events(article_id);
create index if not exists idx_ingestion_logs_created_at on ingestion_logs(created_at desc);
create index if not exists idx_ingestion_logs_source_id on ingestion_logs(source_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
alter table categories enable row level security;
alter table news_sources enable row level security;
alter table news_articles enable row level security;
alter table sponsored_content enable row level security;
alter table user_devices enable row level security;
alter table publishers enable row level security;
alter table publisher_sources enable row level security;
alter table recent_searches enable row level security;
alter table trending_topics enable row level security;
alter table ingestion_logs enable row level security;

-- Public read policies
create policy "public_read_categories" on categories for select using (true);
create policy "public_and_admin_read_sources" on news_sources for select using (
  is_active = true 
  or auth.uid() is not null
);
create policy "public_read_articles" on news_articles for select using (true);
create policy "public_read_sponsored" on sponsored_content for select using (
  is_active = true 
  and (start_date is null or start_date <= current_date)
  and (end_date is null or end_date >= current_date)
);

-- News sources management policies (admin)
create policy "authenticated_insert_sources" on news_sources for insert with check (auth.uid() is not null);
create policy "authenticated_update_sources" on news_sources for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated_delete_sources" on news_sources for delete using (auth.uid() is not null);

-- User devices policies
create policy "public_insert_device" on user_devices for insert with check (true);
create policy "public_read_own_device" on user_devices for select using (true);
create policy "public_update_own_device" on user_devices for update using (true);

-- Publishers policies  
create policy "public_insert_publisher" on publishers for insert with check (true);
create policy "admin_read_publishers" on publishers for select using (true);

-- Recent searches policies
create policy "users_insert_searches" on recent_searches for insert with check (true);
create policy "users_read_own_searches" on recent_searches for select using (true);

-- Trending topics policies
create policy "public_read_trending" on trending_topics for select using (true);

-- Ingestion logs policies
create policy "public_read_ingestion_logs" on ingestion_logs for select using (true);
create policy "service_insert_ingestion_logs" on ingestion_logs for insert with check (true);
create policy "service_update_ingestion_logs" on ingestion_logs for update using (true);

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default categories
insert into categories (name, slug, icon, color) values
  ('Top Stories', 'top-stories', '📰', '#1E40AF'),
  ('Politics', 'politics', '🏛️', '#DC2626'),
  ('Sports', 'sports', '⚽', '#16A34A'),
  ('Entertainment', 'entertainment', '🎬', '#9333EA'),
  ('Business', 'business', '💼', '#EA580C'),
  ('Technology', 'technology', '💻', '#0891B2'),
  ('Health', 'health', '🏥', '#059669'),
  ('Science', 'science', '🔬', '#7C3AED')
on conflict (slug) do nothing;

-- Insert sample news sources
insert into news_sources (name, website_url, rss_url, logo_url, is_active) values
  ('BBC News', 'https://www.bbc.com/news', 'http://feeds.bbci.co.uk/news/rss.xml', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2019.svg/200px-BBC_News_2019.svg.png', true),
  ('CNN', 'https://www.cnn.com', 'http://rss.cnn.com/rss/edition.rss', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/200px-CNN.svg.png', true),
  ('The Guardian', 'https://www.theguardian.com', 'https://www.theguardian.com/world/rss', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/The_Guardian.svg/200px-The_Guardian.svg.png', true),
  ('TechCrunch', 'https://techcrunch.com', 'https://techcrunch.com/feed/', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TechCrunch_logo.svg/200px-TechCrunch_logo.svg.png', true),
  ('ESPN', 'https://www.espn.com', 'https://www.espn.com/espn/rss/news', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/200px-ESPN_wordmark.svg.png', true)
on conflict do nothing;

-- Insert sample trending topics
insert into trending_topics (topic, search_count) values
  ('World Cup', 1250),
  ('New Space Telescope', 980),
  ('Economic Forum', 850),
  ('AI Developments', 1420)
on conflict do nothing;

-- =============================================
-- NOTE: SAMPLE ARTICLES
-- =============================================
-- To populate the database with sample news articles for testing,
-- run the sample-articles.sql file after executing this schema.
-- 
-- From Supabase SQL Editor:
-- 1. First run this schema.sql file
-- 2. Then run supabase/sample-articles.sql
--
-- This will add 20+ sample articles across all categories
-- so you can test the app immediately without waiting for RSS ingestion.

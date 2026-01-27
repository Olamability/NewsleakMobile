-- Migration: Add likes and comments functionality
-- This adds support for article likes and comments

-- =============================================
-- ARTICLE LIKES TABLE
-- =============================================
create table if not exists article_likes (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references news_articles(id) on delete cascade,
  user_id uuid,
  device_id text,
  created_at timestamp with time zone default now(),
  -- Ensure a user can only like an article once
  -- Note: user_id is for authenticated users, device_id is for anonymous users
  -- Only one of these should be set at a time by the application
  unique(article_id, user_id),
  unique(article_id, device_id)
);

-- =============================================
-- ARTICLE COMMENTS TABLE
-- =============================================
create table if not exists article_comments (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references news_articles(id) on delete cascade,
  user_id uuid,
  device_id text,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
create index if not exists idx_article_likes_article_id on article_likes(article_id);
create index if not exists idx_article_likes_user_id on article_likes(user_id);
create index if not exists idx_article_comments_article_id on article_comments(article_id);
create index if not exists idx_article_comments_created_at on article_comments(created_at desc);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
alter table article_likes enable row level security;
alter table article_comments enable row level security;

-- Public read policies
create policy "public_read_likes" on article_likes for select using (true);
create policy "public_read_comments" on article_comments for select using (true);

-- Insert/Delete policies for likes (anyone can like/unlike)
create policy "public_insert_like" on article_likes for insert with check (true);
create policy "public_delete_own_like" on article_likes for delete using (true);

-- Insert policies for comments (anyone can comment)
create policy "public_insert_comment" on article_comments for insert with check (true);
-- Authenticated users can only update/delete their own comments
create policy "auth_users_update_own_comment" on article_comments for update using (
  user_id is not null and user_id = auth.uid()
);
create policy "auth_users_delete_own_comment" on article_comments for delete using (
  user_id is not null and user_id = auth.uid()
);
-- Note: Anonymous comments (device_id only) cannot be edited or deleted
-- This is a security tradeoff to prevent unauthorized modifications without proper authentication

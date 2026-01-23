export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
      };
      news_sources: {
        Row: {
          id: string;
          name: string;
          website_url: string;
          rss_url: string;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          website_url: string;
          rss_url: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          website_url?: string;
          rss_url?: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      news_articles: {
        Row: {
          id: string;
          source_id: string;
          category_id: string | null;
          title: string;
          summary: string;
          image_url: string | null;
          original_url: string;
          published_at: string;
          is_breaking: boolean;
          is_sponsored: boolean;
          quality_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          category_id?: string | null;
          title: string;
          summary: string;
          image_url?: string | null;
          original_url: string;
          published_at?: string;
          is_breaking?: boolean;
          is_sponsored?: boolean;
          quality_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          category_id?: string | null;
          title?: string;
          summary?: string;
          image_url?: string | null;
          original_url?: string;
          published_at?: string;
          is_breaking?: boolean;
          is_sponsored?: boolean;
          quality_score?: number | null;
          created_at?: string;
        };
      };
      sponsored_content: {
        Row: {
          id: string;
          title: string;
          summary: string;
          image_url: string | null;
          cta_url: string;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          summary: string;
          image_url?: string | null;
          cta_url: string;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string;
          image_url?: string | null;
          cta_url?: string;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_devices: {
        Row: {
          id: string;
          user_id: string | null;
          expo_push_token: string;
          platform: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          expo_push_token: string;
          platform?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          expo_push_token?: string;
          platform?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          event_type: string;
          article_id: string | null;
          user_id: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          article_id?: string | null;
          user_id?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          article_id?: string | null;
          user_id?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
      };
      trending_topics: {
        Row: {
          id: string;
          topic: string;
          search_count: number;
          last_searched_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic: string;
          search_count?: number;
          last_searched_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic?: string;
          search_count?: number;
          last_searched_at?: string;
          created_at?: string;
        };
      };
      recent_searches: {
        Row: {
          id: string;
          user_id: string | null;
          query: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          query: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          query?: string;
          created_at?: string;
        };
      };
    };
    Enums: Record<string, never>;
  };
}

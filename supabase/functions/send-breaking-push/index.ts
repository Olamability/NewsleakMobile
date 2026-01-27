import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushNotificationPayload {
  to: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { articleId } = await req.json();

    if (!articleId) {
      throw new Error('articleId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: article, error: articleError } = await supabase
      .from('news_articles')
      .select(
        `
        *,
        news_sources (name)
      `
      )
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      throw new Error('Article not found');
    }

    const { data: devices, error: devicesError } = await supabase
      .from('user_devices')
      .select('expo_push_token')
      .eq('is_active', true);

    if (devicesError || !devices || devices.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No devices to send notifications to',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const pushTokens = devices.map((d) => d.expo_push_token).filter(Boolean);

    const chunks = chunkArray(pushTokens, 100);
    let totalSent = 0;

    for (const chunk of chunks) {
      const messages: PushNotificationPayload = {
        to: chunk,
        title: '🔥 Breaking News',
        body: article.title,
        data: {
          articleId: article.id,
          url: article.original_url,
        },
        sound: 'default',
        badge: 1,
      };

      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (response.ok) {
        totalSent += chunk.length;
      }
    }

    await supabase.from('analytics_events').insert({
      event_type: 'push_notification_sent',
      article_id: articleId,
      metadata: {
        recipients: totalSent,
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Push notifications sent to ${totalSent} devices`,
        recipients: totalSent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

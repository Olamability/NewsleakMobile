import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Parser from 'https://esm.sh/rss-parser@3.13.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  enclosure?: { url: string };
  'media:content'?: { $: { url: string } };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const parser = new Parser();

    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesError) {
      throw sourcesError;
    }

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const source of sources || []) {
      try {
        console.log(`Fetching RSS feed from: ${source.name}`);
        const feed = await parser.parseURL(source.rss_url);

        for (const item of feed.items) {
          const rssItem = item as RSSItem;

          if (!rssItem.title || !rssItem.link) continue;

          const summary = cleanSummary(rssItem.contentSnippet || rssItem.content || rssItem.title);
          const imageUrl = extractImage(rssItem);

          // Use upsert with onConflict to handle duplicates gracefully
          const { error: insertError } = await supabase.from('news_articles').upsert(
            {
              source_id: source.id,
              title: rssItem.title.trim(),
              summary: summary,
              image_url: imageUrl,
              original_url: rssItem.link,
              published_at: rssItem.pubDate
                ? new Date(rssItem.pubDate).toISOString()
                : new Date().toISOString(),
              is_breaking: false,
              is_sponsored: false,
            },
            {
              onConflict: 'original_url',
              ignoreDuplicates: true,
            }
          );

          if (insertError) {
            console.error(`Error inserting article: ${insertError.message}`);
            totalSkipped++;
          } else {
            totalInserted++;
          }
        }
      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Ingested ${totalInserted} articles, skipped ${totalSkipped} duplicates`,
        inserted: totalInserted,
        skipped: totalSkipped,
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

function cleanSummary(text: string): string {
  if (!text) return '';

  const cleaned = text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

  const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const summary = sentences.slice(0, 3).join('. ') + (sentences.length > 0 ? '.' : '');

  return summary.slice(0, 300);
}

function extractImage(item: RSSItem): string | null {
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }

  if (item['media:content']?.$?.url) {
    return item['media:content'].$.url;
  }

  return null;
}

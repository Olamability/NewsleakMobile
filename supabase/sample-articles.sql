-- =============================================
-- SAMPLE NEWS ARTICLES
-- =============================================
-- This file contains sample news articles for testing and development.
-- Run this after executing schema.sql to populate your database with test data.

-- IMPORTANT: This requires that categories and news_sources have been seeded first.
-- The schema.sql file already includes seeds for both tables.

-- Insert sample news articles with realistic content
INSERT INTO news_articles (
  source_id, 
  category_id, 
  title, 
  summary, 
  image_url, 
  original_url,
  published_at,
  is_breaking,
  quality_score
) VALUES
-- Breaking Tech News
(
  (SELECT id FROM news_sources WHERE name = 'TechCrunch' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'technology' LIMIT 1),
  'Revolutionary AI Model Surpasses Human Performance in Complex Tasks',
  'A new artificial intelligence system has demonstrated unprecedented capabilities in solving complex problems, marking a significant milestone in AI development. The model shows remarkable reasoning abilities across multiple domains.',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  'https://techcrunch.com/2026/01/revolutionary-ai-model',
  NOW() - INTERVAL '30 minutes',
  true,
  0.95
),
(
  (SELECT id FROM news_sources WHERE name = 'TechCrunch' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'technology' LIMIT 1),
  'Major Tech Company Announces Breakthrough in Quantum Computing',
  'Scientists have achieved a major breakthrough in quantum computing, potentially revolutionizing data processing capabilities. The new quantum processor demonstrates superior performance in solving previously intractable problems.',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
  'https://techcrunch.com/2026/01/quantum-computing-breakthrough',
  NOW() - INTERVAL '1 hour',
  true,
  0.92
),
-- Technology News
(
  (SELECT id FROM news_sources WHERE name = 'TechCrunch' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'technology' LIMIT 1),
  'New Smartphone Features Eye-Tracking Technology',
  'The latest flagship smartphone includes innovative eye-tracking technology that allows users to control their device with eye movements. This accessibility feature opens new possibilities for hands-free interaction.',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=400&fit=crop',
  'https://techcrunch.com/2026/01/smartphone-eye-tracking',
  NOW() - INTERVAL '3 hours',
  false,
  0.88
),
(
  (SELECT id FROM news_sources WHERE name = 'TechCrunch' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'technology' LIMIT 1),
  'Cloud Computing Market Reaches $500 Billion Milestone',
  'The global cloud computing market has surpassed $500 billion in annual revenue, driven by increased enterprise adoption and remote work trends. Analysts predict continued growth in the coming years.',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
  'https://techcrunch.com/2026/01/cloud-computing-milestone',
  NOW() - INTERVAL '5 hours',
  false,
  0.85
),
-- Sports News
(
  (SELECT id FROM news_sources WHERE name = 'ESPN' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'sports' LIMIT 1),
  'Championship Final Ends in Dramatic Last-Minute Goal',
  'The championship final concluded with a stunning last-minute goal that secured victory for the underdogs. Fans erupted in celebration as the unexpected winner was crowned after an intense 90 minutes of play.',
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=400&fit=crop',
  'https://espn.com/2026/01/championship-final-dramatic-finish',
  NOW() - INTERVAL '2 hours',
  false,
  0.90
),
(
  (SELECT id FROM news_sources WHERE name = 'ESPN' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'sports' LIMIT 1),
  'Olympic Committee Announces New Host City for 2032 Games',
  'The International Olympic Committee has officially announced the host city for the 2032 Summer Olympics. The decision follows months of deliberation and site visits to potential host cities.',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop',
  'https://espn.com/2026/01/olympics-2032-host-city',
  NOW() - INTERVAL '6 hours',
  false,
  0.87
),
(
  (SELECT id FROM news_sources WHERE name = 'ESPN' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'sports' LIMIT 1),
  'Tennis Star Wins Historic Grand Slam Tournament',
  'A rising tennis star has claimed their first Grand Slam title in an impressive display of skill and determination. The victory marks a significant milestone in the young athlete''s career.',
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&h=400&fit=crop',
  'https://espn.com/2026/01/tennis-grand-slam-win',
  NOW() - INTERVAL '8 hours',
  false,
  0.84
),
-- Politics News
(
  (SELECT id FROM news_sources WHERE name = 'BBC News' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'politics' LIMIT 1),
  'World Leaders Gather for Climate Summit',
  'Political leaders from around the globe have convened for an emergency climate summit to discuss urgent action on environmental challenges. Key agreements on emissions reductions are expected.',
  'https://images.unsplash.com/photo-1569163139394-de4798aa62b4?w=800&h=400&fit=crop',
  'https://bbc.com/news/2026/01/climate-summit-world-leaders',
  NOW() - INTERVAL '4 hours',
  false,
  0.91
),
(
  (SELECT id FROM news_sources WHERE name = 'BBC News' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'politics' LIMIT 1),
  'New Trade Agreement Signed Between Major Economic Powers',
  'A landmark trade agreement has been signed between several major economic powers, promising to boost international commerce and reduce trade barriers. The deal took over two years to negotiate.',
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=400&fit=crop',
  'https://bbc.com/news/2026/01/trade-agreement-signed',
  NOW() - INTERVAL '7 hours',
  false,
  0.86
),
(
  (SELECT id FROM news_sources WHERE name = 'BBC News' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'politics' LIMIT 1),
  'Parliament Passes Historic Healthcare Reform Bill',
  'In a historic vote, parliament has passed comprehensive healthcare reform legislation aimed at improving access and reducing costs for millions of citizens. The bill now heads to the executive for final approval.',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop',
  'https://bbc.com/news/2026/01/healthcare-reform-passes',
  NOW() - INTERVAL '10 hours',
  false,
  0.89
),
-- Business News
(
  (SELECT id FROM news_sources WHERE name = 'CNN' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'business' LIMIT 1),
  'Stock Markets Hit Record Highs Amid Economic Optimism',
  'Global stock markets have reached all-time highs as investors show renewed confidence in economic recovery. Strong corporate earnings and positive economic indicators are driving the rally.',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
  'https://cnn.com/business/2026/01/stock-markets-record-highs',
  NOW() - INTERVAL '2 hours',
  false,
  0.88
),
(
  (SELECT id FROM news_sources WHERE name = 'CNN' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'business' LIMIT 1),
  'Tech Startup Valued at $10 Billion in Latest Funding Round',
  'A fast-growing technology startup has raised $500 million in its latest funding round, bringing its valuation to $10 billion. The company plans to use the funds for international expansion and product development.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
  'https://cnn.com/business/2026/01/startup-funding-10-billion',
  NOW() - INTERVAL '5 hours',
  false,
  0.85
),
(
  (SELECT id FROM news_sources WHERE name = 'CNN' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'business' LIMIT 1),
  'Major Merger Announced in Pharmaceutical Industry',
  'Two pharmaceutical giants have announced a merger that will create one of the world''s largest drug manufacturers. The $75 billion deal is expected to close by the end of the year pending regulatory approval.',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=400&fit=crop',
  'https://cnn.com/business/2026/01/pharma-merger-announcement',
  NOW() - INTERVAL '9 hours',
  false,
  0.87
),
-- Entertainment News
(
  (SELECT id FROM news_sources WHERE name = 'The Guardian' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'entertainment' LIMIT 1),
  'Blockbuster Film Breaks Opening Weekend Box Office Records',
  'The highly anticipated blockbuster has shattered opening weekend box office records, earning over $300 million globally. The film\'s success has exceeded industry expectations and studio projections.',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop',
  'https://theguardian.com/film/2026/01/blockbuster-box-office-record',
  NOW() - INTERVAL '3 hours',
  false,
  0.86
),
(
  (SELECT id FROM news_sources WHERE name = 'The Guardian' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'entertainment' LIMIT 1),
  'Award-Winning Actor Announces Retirement from Film',
  'A beloved actor with a career spanning five decades has announced their retirement from film. The announcement comes after receiving a lifetime achievement award at a major film festival.',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=400&fit=crop',
  'https://theguardian.com/film/2026/01/actor-retirement-announcement',
  NOW() - INTERVAL '7 hours',
  false,
  0.83
),
(
  (SELECT id FROM news_sources WHERE name = 'The Guardian' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'entertainment' LIMIT 1),
  'Popular Music Festival Announces Star-Studded Lineup',
  'Organizers of the world\'s largest music festival have unveiled this year\'s lineup featuring dozens of top artists across multiple genres. Tickets are expected to sell out within hours.',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop',
  'https://theguardian.com/music/2026/01/music-festival-lineup',
  NOW() - INTERVAL '11 hours',
  false,
  0.84
),
-- Health News
(
  (SELECT id FROM news_sources WHERE name = 'BBC News' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'health' LIMIT 1),
  'New Study Reveals Breakthrough in Cancer Treatment',
  'Researchers have announced a significant breakthrough in cancer treatment that could improve survival rates for patients with advanced-stage disease. Clinical trials show promising results with minimal side effects.',
  'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=400&fit=crop',
  'https://bbc.com/news/health/2026/01/cancer-treatment-breakthrough',
  NOW() - INTERVAL '4 hours',
  false,
  0.93
),
(
  (SELECT id FROM news_sources WHERE name = 'BBC News' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'health' LIMIT 1),
  'Mental Health Apps Show Promising Results in Clinical Studies',
  'Recent studies demonstrate that mental health apps can be effective tools for managing anxiety and depression. The findings suggest digital therapeutics may complement traditional treatment methods.',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop',
  'https://bbc.com/news/health/2026/01/mental-health-apps-study',
  NOW() - INTERVAL '8 hours',
  false,
  0.87
),
-- Science News
(
  (SELECT id FROM news_sources WHERE name = 'The Guardian' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'science' LIMIT 1),
  'Scientists Discover Earth-Like Planet in Nearby Star System',
  'Astronomers have discovered an Earth-like exoplanet in a nearby star system that could potentially harbor life. The planet orbits within the habitable zone and shows promising atmospheric signatures.',
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&h=400&fit=crop',
  'https://theguardian.com/science/2026/01/earth-like-planet-discovery',
  NOW() - INTERVAL '6 hours',
  false,
  0.92
),
(
  (SELECT id FROM news_sources WHERE name = 'The Guardian' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'science' LIMIT 1),
  'Groundbreaking Research Links Diet to Longevity',
  'A comprehensive study spanning 20 years has revealed strong correlations between specific dietary patterns and increased lifespan. The research provides new insights into the role of nutrition in aging.',
  'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800&h=400&fit=crop',
  'https://theguardian.com/science/2026/01/diet-longevity-research',
  NOW() - INTERVAL '12 hours',
  false,
  0.89
),
-- Top Stories
(
  (SELECT id FROM news_sources WHERE name = 'CNN' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'top-stories' LIMIT 1),
  'Global Summit Addresses Pressing Humanitarian Crisis',
  'World leaders and humanitarian organizations have convened to address an escalating humanitarian crisis affecting millions. The summit aims to coordinate international relief efforts and long-term solutions.',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=400&fit=crop',
  'https://cnn.com/world/2026/01/humanitarian-crisis-summit',
  NOW() - INTERVAL '1 hour',
  true,
  0.94
);

-- Update some articles to have better quality scores
UPDATE news_articles 
SET quality_score = 0.98 
WHERE is_breaking = true;

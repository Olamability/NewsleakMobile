1. PRODUCT VISION (CLARIFIED)

NewsArena is a mobile-first news distribution platform that aggregates headlines and summaries from multiple publishers and actively drives traffic back to original news websites, following the same operational, legal, and UX principles as Opera News Mobile.

The app must never function as a content replacement for publishers.

2. CORE BUSINESS GUARANTEE (NEW – CRITICAL)
Traffic Distribution Guarantee

Every publisher added to NewsArena must receive measurable outbound traffic to their original website.

This is a first-class product requirement, not a side effect.

3. NON-NEGOTIABLE CONTENT & TRAFFIC RULES (NEW)

These rules apply to all articles, all screens, and all future features.

Mandatory

❌ Full articles must NEVER be displayed

✅ Only summaries / excerpts (max 300–400 chars)

✅ Publisher name must always be visible

✅ A clear outbound CTA must exist on every article:

“Read Full Article”

“Continue on {Publisher Name}”

✅ Clicking the CTA must:

Open the publisher’s original URL

Generate a real page view for the publisher

✅ Every outbound click MUST be tracked

Prohibited

No content rewriting

No paywall bypass

No ad injection into publisher pages

No hiding the source

No in-app full reading mode

Violation = Critical defect

4. USER ROLES (UNCHANGED + CLARIFIED)
Guest User (Default)

Read all summaries

Browse categories

Open full articles externally

No login required

Logged-In User (Optional)

Bookmarks

Reading history

Notification preferences

Login must never block traffic flow

5. UX FLOW (OPERA-ACCURATE)
Home → Article → Publisher (MANDATORY FLOW)
Home Feed
  ↓
Article Preview (summary only)
  ↓
Read Full Article (external)
  ↓
Publisher Website


There must be no alternative path that avoids the publisher site.

6. ARTICLE PREVIEW SCREEN (UPDATED REQUIREMENTS)
Display

Title

Featured image

Publisher logo/name

Publish time

Short summary

Primary CTA: Read Full Article

CTA Behavior

Opens original_url

In-app browser OR external browser

Logs outbound click event

7. ANALYTICS & TRAFFIC TRACKING (ENHANCED)
Existing Table (EXTENDED, NOT REPLACED)

analytics_events

New Standardized Event Types
view_article
click_outbound
bookmark
notification_open

Outbound Click Logging (MANDATORY)

Each outbound click must store:

article_id

source_id

publisher name

timestamp

(optional) user_id

This enables:

Publisher performance reports

Future publisher dashboards

Trust & transparency

8. DATABASE EXTENSIONS (MINIMAL & SAFE)
8.1 Extend news_articles
alter table news_articles
add column excerpt_length int default 300;

8.2 Add outbound_clicks (OPTIONAL BUT RECOMMENDED)

This does NOT break analytics_events; it complements it.

create table outbound_clicks (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references news_articles(id) on delete cascade,
  source_id uuid references news_sources(id),
  clicked_at timestamp with time zone default now()
);

9. RSS INGESTION RULES (CLARIFIED)

During ingestion:

Strip all HTML

Never store body content

Limit summaries automatically

Preserve original_url exactly

Reject feeds without valid outbound URLs

10. PUBLISHER TRUST MODEL (NEW SECTION)
Publisher Value Proposition

Free distribution

Real human traffic

Brand visibility

No content theft

Optional paid boosting (future)

Publisher Expectations

RSS must be owned or licensed

Original URLs must remain intact

No spam or fake news

11. FUTURE: PUBLISHER PERFORMANCE DASHBOARD (SUPPORTED BY PRD)

Because traffic is tracked, the platform can later show:

Impressions

Click-through rate (CTR)

Daily outbound clicks

Top-performing articles

This is impossible without the traffic rules above — now it’s guaranteed.

12. GOOGLE PLAY COMPLIANCE (RECONFIRMED)

Attribution always visible

No deceptive redirection

Sponsored content labeled

Privacy policy required

External links allowed (policy-safe)

13. SUCCESS METRICS (UPDATED)
Reader Metrics

DAU / MAU

Session length

Notification CTR

Publisher Metrics (NEW)

Outbound clicks per publisher

Article CTR

Click growth rate

14. AI CODING AGENT – FINAL HARD CONSTRAINTS (UPDATED)

Add this to your MASTER PROMPT:

The app is a traffic distribution platform.
Never optimize for in-app reading.
Always push users to the original publisher.
Outbound clicks are mandatory and tracked.
Any design that reduces publisher traffic is incorrect.

15. DEFINITION OF DONE (UPDATED)

The app is NOT complete unless:

✅ Publisher name is visible everywhere
✅ No full article is readable in-app
✅ Every article has an outbound link
✅ Outbound clicks are logged
✅ Traffic reaches original sites

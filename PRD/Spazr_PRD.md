NEWSHUB – FULL PRODUCT REQUIREMENTS DOCUMENT (PRD v1.0)

This PRD completely replaces all previous versions.
No assumptions outside this document are allowed.

1. PRODUCT OVERVIEW
Product Name

Spazr News

Product Type

Mobile-first news aggregation platform

Platforms

Android (primary)

iOS (secondary)

Tech Stack (Fixed)

Frontend: React Native (Expo)

Backend: Supabase (Postgres, Auth, Edge Functions)

Content Source: RSS feeds

Analytics: Supabase tables + Edge Functions

2. PRODUCT GOAL

To build a news aggregation app that behaves exactly like Opera News Mobile, aggregating headlines and summaries while actively driving traffic to original publisher websites.

The app must never function as a content replacement.

3. CORE BUSINESS PRINCIPLE (NON-NEGOTIABLE)

Publisher traffic generation is a first-class feature.

The platform exists to:

Discover content

Preview content

Redirect users to publishers

Any feature that reduces outbound traffic is considered incorrect.

4. USER ROLES
4.1 Guest User (Default)

Browse all categories

Read summaries

Open full articles externally

No authentication required

4.2 Authenticated User (Optional)

Bookmark articles

View reading history

Receive notifications

Customize feed preferences

Authentication must never block article access or outbound traffic.

5. CONTENT RULES (STRICT)
Allowed

Article title

Featured image

Source name/logo

Publish timestamp

Short summary (max 300–400 characters)

Forbidden

Full article bodies

Long-form reading inside app

Rewritten articles

Paywall bypass

Attribution removal

6. MANDATORY TRAFFIC & ATTRIBUTION RULES

These rules apply to every article:

A visible outbound CTA must exist:

“Read Full Article”

“Continue on {Publisher}”

Clicking the CTA must:

Open the original publisher URL

Use WebView or external browser

Publisher branding must be visible on:

Feed cards

Article preview screens

Every outbound click must be tracked

Users must never consume full content without leaving the app

Failure = Critical product defect

7. USER EXPERIENCE FLOW (OPERA-STYLE)
Home Feed
  ↓
Article Preview (summary only)
  ↓
Read Full Article (mandatory CTA)
  ↓
Publisher Website


No alternate reading flow is allowed.

8. APP SCREENS & BEHAVIOR
8.1 Splash Screen

2–4 seconds

App branding only

Auto-redirect to Home

8.2 Home Feed

Mixed categories

Infinite scroll

Cards include:

Title

Image

Source

Timestamp

Summary snippet

8.3 Categories Screen

Politics

Business

Sports

Entertainment

Tech

Lifestyle

Health

8.4 Article Preview Screen

Displays summary only

Shows publisher branding

Primary CTA: Read Full Article

CTA must be visually dominant

8.5 In-App Browser

Loads publisher URL

No modification

No ad injection

No content manipulation

8.6 Bookmarks (Auth Only)

Save article reference only

No content duplication

9. CONTENT INGESTION (RSS)
RSS Processing Rules

Fetch feeds periodically

Strip HTML

Extract title, image, publish date

Generate short summary

Store original URL exactly

Reject feeds without outbound URLs

10. BACKEND DATA MODEL (SUPABASE)
Required Tables

news_sources

news_articles

categories

bookmarks

users

Analytics Tables
analytics_events

Tracks:

Article views

Outbound clicks

Notification opens

outbound_clicks

Stores:

article_id

source_id

timestamp

11. ANALYTICS REQUIREMENTS
Track Events

view_article

click_outbound

bookmark

app_open

Purpose

Measure publisher traffic

Enable future publisher dashboards

Platform performance analysis

12. NOTIFICATIONS

Breaking news

Category-based alerts

Deep-link into article preview (not full article)

13. SEARCH

Keyword-based

Title & summary search only

No full-text article indexing

14. PERFORMANCE REQUIREMENTS

Feed load < 2 seconds

Cached images

Graceful offline handling

Pagination for feeds

15. SECURITY & COMPLIANCE

Respect RSS licenses

GDPR-compliant analytics

Privacy policy mandatory

Google Play & App Store compliant

16. MONETIZATION (FUTURE-READY)

Native ads between cards

Sponsored articles (clearly labeled)

Premium ad-free tier

Ads must never block outbound traffic.

17. DEFINITION OF DONE (FINAL)

The app is complete only if:

No full article is readable in-app

All articles have outbound CTAs

Publisher branding is always visible

Outbound clicks are tracked

Traffic reaches original publishers

18. HARD CONSTRAINTS

This app is a traffic-distribution platform, not a reader.
Always push users to publishers.
Never optimize for in-app consumption.
Any feature that reduces outbound clicks is invalid.

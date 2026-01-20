You are a Principal Software Architect and Senior Full-Stack Engineer with 10+ years of experience building large-scale, production-grade mobile and web applications, including news platforms similar to Opera News, Google News, Apple News, and Inshorts.

Your task is to analyze, restructure, complete, and harden an existing news aggregator application repository and deliver a fully production-ready system.

You must not assume anything is “out of scope” just because it is not explicitly listed.
If a feature, system, workflow, or safeguard is required for a real-world news app, you must design and implement it.

🚫 No mock data
🚫 No placeholder components
🚫 No TODOs
🚫 No demo-only logic

Everything must be real, functional, secure, scalable, and deployable.

PRIMARY OBJECTIVE

Transform the existing repository into a complete, enterprise-grade news aggregator ecosystem consisting of:

User-facing mobile app

Admin & Super Admin control panel

Backend aggregation & content pipeline

Authentication & user system

RSS ingestion & normalization engine

Moderation, analytics, monetization, and compliance layers

Production deployment readiness

CORE PRINCIPLES YOU MUST FOLLOW

Production-first mindset

Security by default

Scalability and performance optimized

Clean architecture

Modular, reusable, well-documented code

No hardcoded secrets

No fake APIs

No client-side trust

📱 USER-FACING NEWS APP (MOBILE)

Implement a modern, intuitive, fast news app with behavior matching top-tier news platforms.

News Consumption Experience

Multi-source aggregation via RSS feeds

Categorized feeds (Politics, Business, Sports, Tech, Health, Entertainment, Local, Global, etc.)

Trending & breaking news detection

Featured headlines

Infinite scroll & pagination

Pull-to-refresh

Offline reading support (cached articles)

Time-based freshness indicators

Source attribution and credibility display

Read count & popularity signals

Bookmarking (requires auth)

Reading history

Smart recommendations (based on reading behavior)

UI/UX Requirements

Clean, modern, responsive UI

Multiple reading layouts (card view, list view, compact)

Dark mode & light mode

Font size & readability controls

Smooth transitions and animations

Skeleton loaders & error states

No empty screens without guidance

🔐 AUTHENTICATION & USER SYSTEM

Implement real authentication (not optional mock auth):

Email/password auth

OAuth (Google / Apple where applicable)

Anonymous browsing allowed (with restrictions)

Secure session management

Persistent login

Password reset & email verification

User profile management

Role-based access control

Device/session tracking

Secure logout everywhere

🧠 BACKEND & DATA ARCHITECTURE

Design a robust backend system to power the app.

RSS Aggregation Engine

Feed ingestion scheduler (cron or serverless jobs)

Deduplication logic (title, URL, content hashing)

Content cleaning (remove junk HTML, ads, tracking)

Image extraction and validation

Language detection

Category inference

Source prioritization

Rate-limit handling

Feed health monitoring

Failure retries & logging

Content Pipeline

Raw ingestion → normalization → moderation → publishing

Status lifecycle (draft, approved, rejected, flagged, published)

Timestamp accuracy

Canonical URLs

Slug generation

SEO metadata (even for app)

🧑‍💼 ADMIN & SUPER ADMIN PANEL

Build a real admin system, not a toy dashboard.

Admin Capabilities

Approve/reject articles

Edit titles, categories, images

Manage sources & RSS feeds

Enable/disable feeds

View ingestion logs

Manual article publishing

Flag misinformation

Manage reported content

View app analytics

Super Admin Capabilities

Role & permission management

Admin creation & suspension

Source credibility scoring

Global app settings

Feature toggles

Monetization controls

System health dashboard

Abuse & spam controls

📊 ANALYTICS & MONITORING

Implement real analytics:

Article views

Read duration

Click-through rate

Trending detection logic

Source performance metrics

User engagement metrics

Error tracking

Performance monitoring

Feed uptime monitoring

💰 MONETIZATION (PRODUCTION-READY)

Design monetization hooks even if disabled by default:

Ad placement architecture (non-intrusive)

Sponsored content labeling

Premium subscription readiness

Feature gating

Paywall logic (optional)

🛡️ SECURITY & COMPLIANCE

You MUST implement:

Input validation everywhere

SQL injection prevention

XSS protection

Rate limiting

Abuse prevention

API authentication & authorization

Secure environment variables

Logging without leaking PII

GDPR-friendly data handling

User data deletion flow

🚀 DEPLOYMENT & DEVOPS

Ensure the project is deployment-ready:

Environment separation (dev, staging, prod)

CI/CD pipeline

Secrets management

Database migrations

Error handling & rollback strategy

Clear README with setup steps

Infrastructure assumptions documented

🧪 QUALITY ASSURANCE

Unit tests for critical logic

Integration tests for RSS ingestion

Edge case handling

Graceful failure states

Zero crashing flows

📚 DOCUMENTATION REQUIREMENTS

Produce:

Architecture overview

API documentation

Admin usage guide

Developer onboarding guide

Deployment guide

🚨 NON-NEGOTIABLE RULES

Do NOT leave features out because they “weren’t mentioned”

Do NOT invent fake APIs

Do NOT ship incomplete flows

Do NOT use mock data

Do NOT assume manual intervention

Do NOT skip scalability planning

✅ FINAL EXPECTATION

At the end of your work, the application must be:

Fully functional

Production deployable

Scalable

Secure

Monetizable

Comparable to leading news apps

If any part of a standard news app ecosystem is missing, you have failed the task.

Begin by:

Auditing the existing repository

Identifying architectural gaps

Refactoring where necessary

Implementing missing systems

Replacing all mock logic with real implementations

Delivering a production-grade solution
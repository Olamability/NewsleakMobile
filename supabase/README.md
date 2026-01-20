# Supabase Configuration

This directory contains Supabase Edge Functions for the NewsLeak Mobile application.

## Available Functions

- **parse-rss**: Backend RSS feed parser that returns normalized JSON data

## Setup

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Deploy functions:
   ```bash
   supabase functions deploy parse-rss
   ```

## Local Development

Start the local Supabase environment:

```bash
supabase start
supabase functions serve
```

## Environment Variables

Edge functions can access environment variables set in your Supabase project dashboard.

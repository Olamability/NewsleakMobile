# Admin Dashboard Access Guide

## Overview
The admin dashboard has been implemented according to the PRD requirements. It provides comprehensive management capabilities for news sources, articles, and ingestion logs.

## Features Implemented

### 1. Admin Role System
- Added `is_admin` field to User type
- Integrated admin role in authentication flow
- Role-based access control throughout the app

### 2. Admin Dashboard Screens
- **Admin Dashboard**: Central hub for all admin functions
- **Manage Sources**: Enable/disable news sources
- **Manage Articles**: Feature or remove articles
- **Ingestion Logs**: Monitor RSS feed ingestion

### 3. Profile Integration
- Admin badge displayed for admin users
- Admin Dashboard menu item (only visible to admins)

## How to Access Admin Dashboard

### For Testing/Development:

Since the admin role is stored in Supabase user metadata, you need to set it up through Supabase:

#### Option 1: Using Supabase Dashboard (Recommended)
1. Log into your Supabase project dashboard
2. Go to Authentication > Users
3. Find the user you want to make admin
4. Click on the user to edit
5. In the "User Metadata" section (raw JSON), add:
   ```json
   {
     "full_name": "Your Name",
     "is_admin": true
   }
   ```
6. Save changes
7. The user will need to sign out and sign in again to see the admin features

#### Option 2: Using Supabase SQL Editor
1. Go to SQL Editor in your Supabase dashboard
2. Run the following SQL query (replace the email with your test user's email):
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
   WHERE email = 'your-admin-email@example.com';
   ```
3. The user will need to sign out and sign in again to see the admin features

#### Option 3: Programmatic Setup (For Development)
You can also create a temporary admin setup function in your app during development, but this should NOT be used in production.

## Accessing the Dashboard

1. **Sign in** as an admin user (after setting up the admin role as above)
2. Navigate to the **Profile** tab
3. You'll see an "👑 Admin" badge under your name
4. Tap on **"⚙️ Admin Dashboard"** in the Administration section
5. From the dashboard, you can access:
   - Manage News Sources
   - Manage Articles
   - Ingestion Logs
   - User Management (coming soon)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Admin Role Assignment**: Admin roles should ONLY be assigned through:
   - Direct database access by system administrators
   - Secure server-side admin management API (to be implemented)
   - Never allow users to self-assign admin roles

2. **Backend Enforcement**: While the UI restricts admin features based on the `is_admin` flag, you MUST also enforce admin permissions on the backend/API level. The current implementation is UI-only.

3. **Production Setup**: Before deploying to production:
   - Implement backend API endpoints for admin operations
   - Add server-side permission checks on all admin endpoints
   - Consider implementing row-level security (RLS) policies in Supabase
   - Set up audit logging for admin actions

## Current Limitations

The admin screens currently use mock data and placeholders:
- News sources list uses sample data
- Article management uses empty state
- Ingestion logs show mock entries
- Stats on dashboard show "-" placeholders

To make these functional, you'll need to:
1. Implement backend API endpoints for CRUD operations
2. Create database tables for sources and ingestion logs (if not already present)
3. Connect the screens to real data using the services layer
4. Implement proper error handling and loading states

## Next Steps

1. **Backend API Development**:
   - Create admin endpoints in your backend
   - Implement news source CRUD operations
   - Add article moderation endpoints
   - Set up ingestion logging system

2. **Database Schema**:
   - Ensure `news_sources` table exists
   - Create `ingestion_logs` table
   - Add necessary indexes for performance

3. **Security Enhancements**:
   - Implement server-side role checking
   - Add API middleware for admin route protection
   - Set up audit logging

4. **Testing**:
   - Test with different user roles
   - Verify access control restrictions
   - Test on different screen sizes and devices

## Testing Checklist

- [ ] Create a test admin user via Supabase
- [ ] Sign in and verify admin badge appears
- [ ] Access admin dashboard from profile
- [ ] Navigate through all admin screens
- [ ] Test with non-admin user (admin options should not appear)
- [ ] Verify responsive layout on different screen sizes

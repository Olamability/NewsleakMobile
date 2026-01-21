# Admin Dashboard Access Guide

## Overview
The admin dashboard provides comprehensive management capabilities for news sources, articles, and ingestion logs. This guide explains how to access and use the admin features securely.

## Security Architecture

### Multi-Layer Admin Protection

The admin system is now protected by multiple security layers:

1. **Database-Level Security (RLS Policies)**
   - Admin role assignments are stored in the `admin_users` table
   - Row-Level Security (RLS) policies prevent unauthorized access
   - Client-side users CANNOT modify admin roles or metadata
   - Only service role (backend) can create/modify admin users

2. **Metadata Protection**
   - The `is_admin` flag is stored in Supabase auth user metadata
   - Users CANNOT modify this flag through the `updateProfile` function
   - Admin-related fields are filtered out from all client-side updates
   - Automatic synchronization between `admin_users` table and auth metadata via database trigger

3. **Role Hierarchy**
   - **Editor**: Basic admin access (can moderate content)
   - **Admin**: Full admin access (can manage sources, articles, campaigns)
   - **Super Admin**: Highest level (can manage other admins, system-wide settings)

## Features Implemented

### 1. Admin Role System
- `admin_users` table with foreign key to auth.users
- Role validation: editor | admin | super_admin
- Automatic metadata synchronization via database triggers
- Protected RLS policies preventing client-side modifications

### 2. Admin Dashboard Screens
- **Admin Dashboard**: Central hub for all admin functions
- **Manage Sources**: Enable/disable news sources
- **Manage Articles**: Feature or remove articles
- **Ingestion Logs**: Monitor RSS feed ingestion

### 3. Profile Integration
- Admin badge displayed for admin users
- Admin Dashboard menu item (only visible to admins)
- Role level displayed (if applicable)

## How to Access Admin Dashboard

### For Testing/Development:

Admin roles MUST be assigned by system administrators through secure backend access. Regular users cannot make themselves admin.

#### Option 1: Using Supabase SQL Editor (Recommended for Setup)

1. Log into your Supabase project dashboard
2. Go to SQL Editor
3. Run the following SQL to create an admin user:

```sql
-- Step 1: Insert admin user into admin_users table
INSERT INTO admin_users (id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'),
  'admin'  -- or 'editor' or 'super_admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- The database trigger will automatically sync is_admin to auth metadata
```

4. The user will need to sign out and sign in again to see the admin features

#### Option 2: Verify Admin Status

To check if admin metadata is synced correctly:

```sql
-- Check both admin_users table and auth metadata
SELECT 
  u.email,
  u.raw_user_meta_data->>'is_admin' as metadata_is_admin,
  CASE WHEN au.id IS NOT NULL THEN 'true' ELSE 'false' END as in_admin_table,
  au.role as admin_role
FROM auth.users u
LEFT JOIN admin_users au ON u.id = au.id
WHERE u.email = 'your-admin-email@example.com';
```

#### Option 3: Remove Admin Access

To remove admin access from a user:

```sql
-- Delete from admin_users table
DELETE FROM admin_users WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user-email@example.com'
);

-- The trigger will automatically set is_admin to false in metadata
```

### Important Security Notes:

⚠️ **CRITICAL**: The following actions are **BLOCKED** on the client side:
- Users cannot insert themselves into `admin_users` table
- Users cannot update their role in `admin_users` table
- Users cannot delete themselves from `admin_users` table
- Users cannot modify `is_admin` flag via `updateProfile()` function

These protections are enforced by:
1. RLS policies on `admin_users` table (all client operations return `false`)
2. Filtered updates in `AuthService.updateProfile()` (strips out admin fields)
3. Database-level foreign key constraints and role validation

## Accessing the Dashboard

1. **Sign in** as an admin user (after setting up the admin role as above)
2. Navigate to the **Profile** tab
3. You'll see an "👑 Admin" badge under your name
4. If you have a role, it will be displayed (e.g., "Role: Admin")
5. Tap on **"⚙️ Admin Dashboard"** in the Administration section
6. From the dashboard, you can access:
   - Manage News Sources (requires admin check)
   - Manage Articles
   - Ingestion Logs
   - User Management (coming soon)

## Admin API Service

### AdminRoleService

The new `AdminRoleService` provides secure role management:

```typescript
// Check if current user is admin
const isAdmin = await AdminRoleService.isCurrentUserAdmin();

// Get current user's role
const role = await AdminRoleService.getCurrentUserRole();
// Returns: 'editor' | 'admin' | 'super_admin' | null

// Check if user has specific role level
const hasAccess = await AdminRoleService.hasRoleLevel('admin');

// List all admin users (requires admin access)
const { data, error } = await AdminRoleService.listAllAdmins();

// Verify admin/metadata sync
const syncStatus = await AdminRoleService.verifyAdminSync();
```

### Protected Admin Operations

Admin operations now include access checks:

```typescript
// Example: Add a news source
// This will fail if user is not admin
const result = await AdminService.addSource('Source Name', 'https://rss.url');
```

## Security Best Practices

### For Production Deployment:

1. **Never expose service role key** in client-side code
   - Service role key should only be used in backend services
   - Use Edge Functions for admin operations requiring service role

2. **Backend API for Admin Management**
   - Create Supabase Edge Functions for admin user management
   - Implement proper authentication in Edge Functions
   - Example Edge Function structure:
   ```typescript
   // supabase/functions/manage-admin/index.ts
   import { createClient } from '@supabase/supabase-js'
   
   Deno.serve(async (req) => {
     const supabaseAdmin = createClient(
       Deno.env.get('SUPABASE_URL'),
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
     )
     
     // Verify caller is super_admin
     const authHeader = req.headers.get('Authorization')
     // ... authentication logic
     
     // Perform admin operations with service role
     const { data, error } = await supabaseAdmin
       .from('admin_users')
       .insert({ id: userId, role: 'admin' })
     
     return new Response(JSON.stringify({ data, error }))
   })
   ```

3. **Audit Logging**
   - Log all admin actions (who, what, when)
   - Monitor suspicious activities
   - Set up alerts for unauthorized access attempts

4. **Regular Security Audits**
   - Review admin user list regularly
   - Remove inactive admin users
   - Verify metadata sync status

## Database Schema

### admin_users Table

```sql
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text default 'editor' check (role in ('editor', 'admin', 'super_admin')),
  created_at timestamp with time zone default now()
);
```

### RLS Policies

```sql
-- Users can only read their own admin record
create policy "users_read_own_admin" on admin_users 
  for select using (auth.uid() = id);

-- Client-side inserts/updates/deletes are blocked
create policy "service_role_insert_admin" on admin_users 
  for insert with check (false);

create policy "service_role_update_admin" on admin_users 
  for update using (false);

create policy "service_role_delete_admin" on admin_users 
  for delete using (false);
```

### Database Functions

The schema includes helper functions:

- `is_admin(user_id)`: Check if user is admin
- `get_admin_role(user_id)`: Get user's admin role
- `sync_admin_metadata()`: Trigger function to auto-sync metadata

### Automatic Sync Trigger

```sql
create trigger sync_admin_metadata_trigger
  after insert or delete on admin_users
  for each row
  execute function sync_admin_metadata();
```

This trigger ensures that whenever a user is added to or removed from `admin_users`, their `is_admin` flag in auth metadata is automatically updated.

## Troubleshooting

### Admin features not showing after role assignment

1. User must sign out and sign in again
2. Verify sync status:
   ```typescript
   const syncStatus = await AdminRoleService.verifyAdminSync();
   console.log(syncStatus);
   ```
3. If not synced, manually run sync trigger or re-insert admin record

### Cannot modify admin roles from app

This is **expected behavior**! Admin roles can only be modified by:
- System administrators via SQL
- Backend services with service role key
- This protects against privilege escalation attacks

### Admin user deleted but still has access

1. Check if trigger executed properly
2. Manually update metadata:
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": false}'::jsonb
   WHERE email = 'user@example.com';
   ```
3. User must sign out and sign in again

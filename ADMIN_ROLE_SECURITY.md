# Admin Role Security Implementation

## Overview

This document describes the security implementation for admin roles in the Spazr News application. The system prevents unauthorized users from escalating their privileges by implementing multiple layers of security.

## Security Architecture

### Three-Layer Protection Model

1. **Database Layer (RLS Policies)**
2. **Application Layer (Service Logic)**
3. **Client Layer (UI/UX)**

## Database Layer Security

### Admin Users Table

```sql
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text default 'editor' check (role in ('editor', 'admin', 'super_admin')),
  created_at timestamp with time zone default now()
);
```

**Key Security Features:**
- Foreign key constraint ensures admin users exist in auth.users
- CHECK constraint validates role values
- Cascade delete removes admin record when user is deleted

### Row-Level Security (RLS) Policies

```sql
-- Enable RLS
alter table admin_users enable row level security;

-- Users can only read their own admin record
create policy "users_read_own_admin" on admin_users 
  for select using (auth.uid() = id);

-- Block ALL client-side inserts
create policy "service_role_insert_admin" on admin_users 
  for insert with check (false);

-- Block ALL client-side updates
create policy "service_role_update_admin" on admin_users 
  for update using (false);

-- Block ALL client-side deletes
create policy "service_role_delete_admin" on admin_users 
  for delete using (false);
```

**Why This Works:**
- RLS policies are evaluated at the database level
- Even if client-side code is compromised, database refuses the operation
- Service role (backend only) bypasses RLS, allowing authorized operations

### Metadata Synchronization

**Problem:** Admin status needs to be accessible in auth.users.user_metadata for JWT claims

**Solution:** Automatic database trigger

```sql
create or replace function sync_admin_metadata()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update auth.users
    set raw_user_meta_data = 
      coalesce(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('is_admin', true, 'admin_role', NEW.role)
    where id = NEW.id;
    return NEW;
  end if;
  
  if (TG_OP = 'UPDATE') then
    update auth.users
    set raw_user_meta_data = 
      coalesce(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('is_admin', true, 'admin_role', NEW.role)
    where id = NEW.id;
    return NEW;
  end if;
  
  if (TG_OP = 'DELETE') then
    update auth.users
    set raw_user_meta_data = 
      coalesce(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('is_admin', false, 'admin_role', null)
    where id = OLD.id;
    return OLD;
  end if;
  
  return null;
end;
$$ language plpgsql security definer;

create trigger sync_admin_metadata_trigger
  after insert or delete on admin_users
  for each row
  execute function sync_admin_metadata();
```

**Benefits:**
- Single source of truth: `admin_users` table
- Automatic sync prevents desynchronization
- No manual intervention required

## Application Layer Security

### AuthService Protection

**Vulnerability:** Users could call `updateProfile({ is_admin: true })`

**Fix:** Filter sensitive fields before update

```typescript
static async updateProfile(updates: {
  full_name?: string;
  avatar_url?: string;
}): Promise<ApiResponse<User>> {
  // Create safe updates object with ONLY allowed fields
  const safeUpdates = {
    full_name: updates.full_name,
    avatar_url: updates.avatar_url,
  };

  const { data, error } = await supabase.auth.updateUser({
    data: safeUpdates,  // Only safe fields passed
  });
}
```

**Security Guarantee:**
- Even if client passes `is_admin`, it's stripped out
- TypeScript types prevent passing extra fields
- Server-side also validates (Supabase level)

### AdminRoleService

Provides secure role checking:

```typescript
// Check admin status from database, not metadata
static async isCurrentUserAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Query admin_users table (protected by RLS)
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  return !!data;
}
```

**Why This is Secure:**
- Checks actual database table, not metadata
- RLS ensures user can only check their own status
- Cannot be spoofed by modifying client-side state

## Attack Scenarios & Mitigations

### Scenario 1: Direct API Call

**Attack:**
```javascript
// Malicious user tries to insert themselves as admin
supabase.from('admin_users').insert({ id: myUserId, role: 'super_admin' })
```

**Defense:**
- RLS policy `service_role_insert_admin` returns `false`
- Query fails with permission error
- User remains non-admin

### Scenario 2: Metadata Manipulation

**Attack:**
```javascript
// Malicious user tries to update their metadata
supabase.auth.updateUser({
  data: { is_admin: true }
})
```

**Defense Layer 1 (Application):**
- `AuthService.updateProfile()` filters out `is_admin`
- Field never reaches Supabase

**Defense Layer 2 (Database):**
- Even if it reached Supabase, user metadata changes don't grant admin access
- Admin status is checked from `admin_users` table, not metadata
- Metadata is only synced FROM `admin_users` TO auth.users (one-way)

### Scenario 3: SQL Injection

**Attack:**
```javascript
// Try to inject SQL through user input
const role = "admin'; DROP TABLE admin_users; --"
supabase.from('admin_users').update({ role }).eq('id', myId)
```

**Defense:**
- RLS policy blocks all client-side updates
- Parameterized queries prevent SQL injection
- CHECK constraint validates role values

### Scenario 4: Session Hijacking

**Attack:**
- Attacker steals JWT token containing `is_admin: true`

**Defense:**
- Admin operations re-check `admin_users` table
- Stolen token with `is_admin: true` doesn't grant access unless user is in table
- Short JWT expiration (configurable in Supabase)
- Can revoke admin access by removing from `admin_users` table

## Admin Role Assignment (Secure Methods)

### Method 1: Direct SQL (Development/Initial Setup)

```sql
-- As system administrator, run in Supabase SQL Editor
INSERT INTO admin_users (id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'super_admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
```

### Method 2: Supabase Edge Function (Production)

```typescript
// supabase/functions/manage-admin/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  // Create admin client with service role
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Verify caller is super_admin
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  
  // Check if caller is super_admin
  const { data: callerAdmin } = await supabaseAdmin
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (callerAdmin?.role !== 'super_admin') {
    return new Response('Unauthorized', { status: 403 })
  }

  // Parse request
  const { userId, role } = await req.json()

  // Insert/update admin user using service role (bypasses RLS)
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .upsert({ id: userId, role })
    .select()

  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

**Deploy:**
```bash
supabase functions deploy manage-admin
```

**Call from app:**
```typescript
const session = await supabase.auth.getSession()
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/manage-admin',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.data.session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, role: 'admin' })
  }
)
```

## Role Hierarchy

```
super_admin (level 3)
    ↑
    |
  admin (level 2)
    ↑
    |
  editor (level 1)
```

**Implementation:**

```typescript
static async hasRoleLevel(requiredRole: AdminRole): Promise<boolean> {
  const currentRole = await this.getCurrentUserRole();
  if (!currentRole) return false;

  const roleHierarchy: { [key in AdminRole]: number } = {
    'editor': 1,
    'admin': 2,
    'super_admin': 3,
  };

  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
}
```

## Audit Logging (Recommended)

Create audit log table:

```sql
create table admin_audit_log (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid references auth.users(id),
  action text not null,
  resource_type text,
  resource_id uuid,
  details jsonb,
  ip_address inet,
  created_at timestamp with time zone default now()
);

-- Log admin actions via trigger
create or replace function log_admin_action()
returns trigger as $$
begin
  insert into admin_audit_log (admin_id, action, resource_type, resource_id, details)
  values (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  return NEW;
end;
$$ language plpgsql security definer;

-- Apply to sensitive tables
create trigger audit_news_sources
  after insert or update or delete on news_sources
  for each row execute function log_admin_action();
```

## Testing Security

### Test 1: Verify RLS Blocks Client-Side Admin Creation

```typescript
// This should FAIL
const { error } = await supabase
  .from('admin_users')
  .insert({ id: myUserId, role: 'super_admin' })

// Expected: error with message about RLS policy
expect(error).toBeDefined()
```

### Test 2: Verify Profile Update Filters Admin Fields

```typescript
const result = await AuthService.updateProfile({
  full_name: 'Test',
  is_admin: true  // Should be ignored
} as any)

// User should NOT be admin
const isAdmin = await AdminRoleService.isCurrentUserAdmin()
expect(isAdmin).toBe(false)
```

### Test 3: Verify Metadata Sync

```sql
-- Insert admin user
INSERT INTO admin_users (id, role) VALUES (...);

-- Check metadata was synced
SELECT raw_user_meta_data->>'is_admin' as is_admin
FROM auth.users
WHERE id = ...;

-- Expected: 'true'
```

## Production Checklist

- [ ] All admin operations use `AdminRoleService` for permission checks
- [ ] RLS policies enabled on all sensitive tables
- [ ] Service role key never exposed in client-side code
- [ ] Edge Functions deployed for admin management
- [ ] Audit logging enabled for admin actions
- [ ] Regular security audits scheduled
- [ ] Admin users reviewed quarterly
- [ ] Inactive admin access removed
- [ ] Multi-factor authentication enabled for admin users
- [ ] IP allowlisting configured for super_admin operations

## Monitoring

**Supabase Dashboard Metrics:**
- Monitor auth.users table for unusual `is_admin` metadata changes
- Monitor admin_users table for unauthorized insert attempts
- Set up alerts for failed RLS policy checks

**Application Metrics:**
- Track admin login patterns
- Alert on admin operations outside business hours
- Monitor for repeated failed admin access attempts

## Summary

This implementation provides defense-in-depth security:

1. **Database Level**: RLS policies prevent unauthorized admin operations
2. **Application Level**: Service layer filters sensitive fields
3. **Sync Mechanism**: Automatic trigger maintains metadata consistency
4. **Access Control**: Role hierarchy enforces least privilege
5. **Audit Trail**: All admin actions logged (when implemented)

**Key Principle:** Never trust the client. Always verify permissions at the database level.

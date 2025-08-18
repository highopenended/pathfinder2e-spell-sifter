# Database Permissions Testing Guide

This guide explains how to test your database permissions and Row Level Security (RLS) policies to ensure they're working correctly.

## Overview

The testing setup includes:
1. **React Component** (`DatabaseTest.tsx`) - Integrated into your app for easy testing
2. **SQL Script** (`db/test_permissions.sql`) - Direct database testing in Supabase
3. **JavaScript Test** (`test_database_permissions.js`) - Standalone script for browser/Node.js

## Testing Your Database Permissions

### Option 1: React Component (Recommended)

The `DatabaseTest` component is now integrated into your app. Simply:

1. Navigate to your app
2. Look for the "Database Permissions Test" section in the left sidebar
3. Click "Run Database Test"
4. Review the results

**What it tests:**
- ✅ Basic table access (spells, traditions, traits, sources)
- ✅ Join table access (spell_traditions, spell_traits)
- ✅ Extended view access (v_spells_extended)
- ✅ Complex join queries
- ✅ Filtering and search operations
- ✅ Count queries
- ✅ Helper functions (with warnings for expected anon role limitations)

### Option 2: SQL Script in Supabase

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `db/test_permissions.sql`
4. Run the script
5. Review the results

**What it tests:**
- All the same functionality as the React component
- Plus RLS policy verification
- Direct database access confirmation

### Option 3: Browser Console

1. Open your app in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy and paste the contents of `test_database_permissions.js`
5. Press Enter to run

## Expected Results

### ✅ Success Indicators
- All basic table queries return data
- Join tables are accessible
- Views work correctly
- Filtering and search functions properly
- Count queries return accurate numbers

### ⚠️ Expected Warnings
- Helper functions (`fn_spell_ids_with_any_traits`) may fail for anon role
- This is normal and expected behavior

### ❌ Error Indicators
- Permission denied errors
- Table not found errors
- RLS policy violations

## Troubleshooting Common Issues

### Permission Denied Errors
- Check that RLS is enabled on all tables
- Verify that `anon` and `public` roles have `SELECT` permissions
- Ensure RLS policies allow read access

### Table Not Found Errors
- Verify all migrations have been run
- Check that tables exist in the correct schema
- Ensure table names match exactly

### RLS Policy Issues
- Review the policies in `005_rls_policies.sql`
- Check that policies are applied to the correct roles
- Verify policy conditions are correct

## RLS Policy Review

Your current RLS setup:
- **All tables have RLS enabled**
- **Both `anon` and `public` roles have read access**
- **Policies allow `SELECT` operations for all users**
- **No write permissions for anonymous users**

## Next Steps After Testing

1. **If all tests pass**: Your RLS policies are working correctly
2. **If some tests fail**: Review the specific error messages and check corresponding policies
3. **If helper functions fail**: This is expected for anon role - consider creating a public API endpoint if needed
4. **For production**: Consider restricting access based on user authentication status

## Security Considerations

- Current policies allow public read access to all data
- Consider implementing user-specific policies if you need data isolation
- Helper functions may need elevated permissions for authenticated users
- Monitor access patterns and adjust policies as needed

## Support

If you encounter persistent issues:
1. Check the browser console for detailed error messages
2. Review Supabase logs for server-side errors
3. Verify your environment variables are set correctly
4. Ensure all migrations have been applied successfully

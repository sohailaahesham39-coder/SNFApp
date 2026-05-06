# Supabase Setup Instructions

## Prerequisites
- Supabase account
- Existing Supabase project
- Firebase project configured for Auth

## Step 1: Get Supabase Credentials

1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - Project URL
   - anon/public key
   - service_role key

Keep the `service_role` key secret. Never expose it in the app client.

## Step 2: Create Environment Variables

Create a `.env` file in the project root with:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
```

Restart Expo after editing `.env`.

## Step 3: Create the Archive Table

Run `create-local-data-archive-table.sql` in the Supabase SQL Editor.

This table is used to store the local datasets in an archive format:
- meals
- workouts
- health conditions
- allergens
- chatbot responses
- medical engine data
- habit plan data

## Step 4: Create Production Tables

Run `create-production-tables.sql` in the Supabase SQL Editor.

This creates the app-facing tables used by the client:
- `meals`
- `workouts`
- `user_progress`

## Step 5: Fix RLS Policies

Run `fix-rls-policies.sql` in the Supabase SQL Editor.

This ensures:
- public read access for reference tables
- user-scoped access for progress rows

## Step 6: Seed Data

Seed the archive table with the local datasets:

```bash
npm run seed:archive
```

Seed the production tables:

```bash
npm run seed:production
```

If the seed scripts are not available yet, run the SQL files and insert rows manually from the local data arrays.

## Step 7: Verify in Supabase

Check these tables in **Table Editor**:
- `local_data_archive`
- `meals`
- `workouts`
- `user_progress`

Expected result:
- local data is archived
- meals and workouts are visible to the app
- user progress can be saved per logged-in user

## Step 8: Test the App

1. Start the app
2. Sign in with email/password
3. Try Google sign-in
4. Try Apple sign-in if enabled in Supabase and Apple developer settings
5. Open Meals and Workout tabs
6. Save progress and confirm the data appears in Supabase

## Troubleshooting

### Missing Supabase credentials
- Verify `.env` exists
- Verify the keys are correct
- Restart Expo after changes

### Login works in Supabase but not Firebase
- Confirm all `EXPO_PUBLIC_FIREBASE_*` keys are set
- Confirm Firebase Email/Password provider is enabled

### Google sign-in fails
- Verify `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Confirm Google provider is enabled in both Firebase and Supabase
- Confirm redirect URIs match your Expo scheme

### Apple sign-in fails
- Enable Apple provider in Supabase
- Configure Apple Sign In in Firebase if needed
- Make sure Apple Developer settings are complete

### Data does not appear in Supabase
- Confirm `local_data_archive` exists
- Confirm RLS policies allow the required operation
- Confirm the service role key is used only in server-side scripts

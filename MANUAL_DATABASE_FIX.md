# Manual Database Fix Required

## The Problem
The application cannot connect to the database because the DATABASE_URL environment variable is pointing to an old, inaccessible database.

**Current DATABASE_URL**: `postgresql://neondb_owner:npg_5GDynqR2VoUX@ep-little-shape-aempquvu.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require`

This database is returning: `password authentication failed for user 'neondb_owner'`

## The Solution

### Step 1: Access Replit Secrets
1. Open the Tools panel on the left side of Replit
2. Click on "Secrets" (or search for it in the Tools menu)

### Step 2: Check Database Variables
Look for these environment variables:
- `DATABASE_URL`
- `PGHOST`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`
- `PGPORT`

### Step 3: Update with New Database Credentials

You have two options:

#### Option A: Get New Database from Replit
1. In the Tools panel, find "PostgreSQL" or "Database"
2. If there's an option to create a new database or view connection details, use that
3. Copy the new DATABASE_URL and other credentials
4. Update all the PG* variables in Secrets with the new values

#### Option B: Use Existing Database (if accessible)
1. If you have access to a different PostgreSQL database (local or cloud)
2. Update the DATABASE_URL in Secrets with your database connection string
3. Format: `postgresql://username:password@host:port/database?sslmode=require`

### Step 4: Restart the Application
After updating the secrets:
1. The workflow should automatically restart
2. OR click the "Stop" button and then "Run" again
3. Check the console for "✓ Database connection successful"

### Step 5: Verify It Works
Once the server starts, you should see:
```
Running database migrations...
DATABASE_URL: postgresql://...
✓ Database connection successful
```

## What I've Already Done
- ✅ Created automatic migration script that will create all database tables on startup
- ✅ Added connection testing to provide clear error messages
- ✅ Fixed TypeScript errors in the codebase
- ✅ Set up the app to be fully functional once database is connected

## Once Fixed
The app will be fully functional with:
- User authentication via Replit Auth
- Profile creation and management
- Tinder-style swiping
- Real-time chat between matches
- Match notifications
- All settings and preferences working

## Need Help?
If you're having trouble finding or updating the database credentials, please let me know and I can guide you through the specific steps!

# Supabase Database Setup Guide

This guide will help you set up your Supabase database connection for the Church Management System.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the following values:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

## Step 2: Get Your Database URL

1. In your Supabase dashboard, go to **Settings** > **Database**
2. Scroll down to **Connection string**
3. Select **Nodejs** and copy the connection string
4. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Update Your .env File

Replace the placeholder values in your `.env` file with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-actual-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-actual-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key-here"

# Database URL for Prisma (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres"
```

## Step 4: Enable Row Level Security (RLS)

For security, you should enable RLS on your tables. In your Supabase dashboard:

1. Go to **Authentication** > **Policies**
2. Enable RLS for each table
3. Create appropriate policies based on your needs

## Step 5: Push Your Schema to Supabase

Once your credentials are properly configured, run:

```bash
npx prisma db push
```

This will create all the tables defined in your Prisma schema.

## Step 6: Generate Prisma Client

```bash
npx prisma generate
```

## Step 7: Test Your Connection

Create a simple test to verify your connection works:

```typescript
// test-connection.ts
import { prisma } from './lib/prisma'
import { supabase } from './lib/supabase'

async function testConnection() {
  try {
    // Test Prisma connection
    const userCount = await prisma.user.count()
    console.log('Prisma connection successful. User count:', userCount)
    
    // Test Supabase connection
    const { data, error } = await supabase.from('User').select('count')
    if (error) {
      console.error('Supabase connection error:', error)
    } else {
      console.log('Supabase connection successful')
    }
  } catch (error) {
    console.error('Connection test failed:', error)
  }
}

testConnection()
```

## Troubleshooting

### Common Issues:

1. **Connection timeout**: Check if your DATABASE_URL is correct and your Supabase project is active
2. **Authentication failed**: Verify your database password is correct
3. **SSL errors**: Ensure you're using the correct connection string format

### Security Notes:

- Never commit your `.env` file to version control
- Use environment variables in production
- Regularly rotate your service role keys
- Enable RLS on all tables that contain sensitive data

## Database Schema Overview

Your Prisma schema includes the following main entities:

- **User**: System users with authentication
- **Member**: Church members with personal information
- **Family**: Family groupings for members

- **Communication**: Announcements and messages
- **Ministry**: Church ministries and departments
- **Donation**: Financial contributions tracking
- **Report**: Generated reports and analytics
- **ChurchSettings**: Application configuration
- **AuditLog**: System activity tracking

## Next Steps

1. Set up authentication using Supabase Auth
2. Implement API routes using the database service functions
3. Create forms for data entry
4. Set up proper error handling and validation
5. Implement backup and recovery procedures

For more detailed information, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
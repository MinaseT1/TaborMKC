// Test script to check environment variables
require('dotenv').config();
console.log('Environment Variables Test:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('Service Role Key Length:', process.env.SUPABASE_SERVICE_ROLE_KEY.length);
  console.log('Service Role Key Preview:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
} else {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY is not loaded!');
}

// Test Supabase client creation
try {
  const { createClient } = require('@supabase/supabase-js');
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    console.log('✅ Supabase admin client created successfully');
    
    // Test bucket listing
    supabaseAdmin.storage.listBuckets().then(({ data, error }) => {
      if (error) {
        console.log('❌ Error listing buckets:', error.message);
      } else {
        console.log('✅ Buckets listed successfully:', data?.map(b => b.name));
      }
    }).catch(err => {
      console.log('❌ Error in bucket test:', err.message);
    });
  } else {
    console.log('❌ Missing required environment variables for Supabase admin client');
  }
} catch (error) {
  console.log('❌ Error testing Supabase:', error.message);
}
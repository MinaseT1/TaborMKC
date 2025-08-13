// Import Supabase clients directly
import { getSupabase, getSupabaseAdmin } from './supabase';

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  try {
    const isBrowser = typeof window !== 'undefined';
    const hasUrl = !!(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const hasAnonKey = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    if (isBrowser) {
      // Client-side: only check public environment variables
      console.log('🔧 Client-side Supabase configuration check:', {
        url: hasUrl,
        anonKey: hasAnonKey
      });
      return hasUrl && hasAnonKey;
    } else {
      // Server-side: check all required environment variables
      const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY);
      console.log('🔧 Server-side Supabase configuration check:', {
        url: hasUrl,
        anonKey: hasAnonKey,
        serviceKey: hasServiceKey
      });
      return hasUrl && hasAnonKey && hasServiceKey;
    }
  } catch (error) {
    console.error('Error checking Supabase configuration:', error);
    return false;
  }
}

// Lazy load supabase client
function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  try {
    return getSupabase();
  } catch (error) {
    console.error('Failed to load Supabase client:', error);
    return null;
  }
}

// Get admin client for bucket operations
function getSupabaseAdminClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  try {
    return getSupabaseAdmin();
  } catch (error) {
    console.error('Failed to load Supabase admin client:', error);
    return null;
  }
}

/**
 * Uploads an image file to Supabase storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'member-photos')
 * @param folder - Optional folder path within the bucket
 * @returns Promise<{url: string, path: string} | null> - The public URL and storage path, or null if failed
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: string = 'member-photos',
  folder?: string
): Promise<{url: string, path: string} | null> {
  const supabase = getSupabaseClient();
  const supabaseAdmin = getSupabaseAdminClient();
  
  if (!supabase || !supabaseAdmin) {
    console.warn('Supabase is not properly configured. Skipping image upload.');
    return null;
  }

  try {
    console.log('🔄 Starting image upload process...');
    console.log('📁 File details:', { name: file.name, size: file.size, type: file.type });
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    console.log('📍 Upload path:', filePath);

    // Try upload with admin client first (more reliable)
    console.log('⬆️ Attempting upload with admin client...');
    let { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    // If admin client fails, try with regular client
    if (error) {
      console.log('❌ Admin client upload failed:', error.message);
      console.log('⬆️ Trying with regular client...');
      const regularResult = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      data = regularResult.data;
      error = regularResult.error;
    }

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    console.log('✅ Upload successful!');

    // Get public URL using regular client (this should work for public buckets)
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    return null;
  }
}

/**
 * Deletes an image from Supabase storage
 * @param path - The storage path of the file to delete
 * @param bucket - The storage bucket name (default: 'member-photos')
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function deleteImageFromSupabase(
  path: string,
  bucket: string = 'member-photos'
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const supabaseAdmin = getSupabaseAdminClient();
  
  if (!supabase || !supabaseAdmin) {
    console.warn('Supabase is not properly configured. Skipping image deletion.');
    return false;
  }

  try {
    // Try delete with regular client first
    let { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    // If regular client fails due to RLS, try with admin client
    if (error && error.message && error.message.includes('row-level security')) {
      console.log('Regular client delete failed due to RLS, using admin client...');
      const adminResult = await supabaseAdmin.storage
        .from(bucket)
        .remove([path]);
      
      error = adminResult.error;
    }

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImageFromSupabase:', error);
    return false;
  }
}

/**
 * Client-side check if Supabase storage is configured and accessible
 * This only checks if the basic Supabase client can be created
 * @returns Promise<boolean> - True if storage appears to be configured
 */
export async function ensureBucketExists(): Promise<boolean> {
  // Check if we're in browser environment
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // Client-side: only check if basic Supabase client can be created
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      console.warn('🔧 Supabase client is not properly configured.');
      return false;
    }
    
    try {
      // Simple test to see if we can access storage
      // We'll try to get the public URL for a test path
      const { data } = supabase.storage
        .from('member-photos')
        .getPublicUrl('test');
      
      // If we get a URL back, storage is likely configured
      const isConfigured = !!(data?.publicUrl);
      console.log('✅ Client-side storage check passed:', isConfigured);
      return isConfigured;
    } catch (error) {
      console.warn('⚠️ Client-side storage check failed:', error);
      return false;
    }
  } else {
    // Server-side: use admin client for full bucket check
    const supabaseAdmin = getSupabaseAdminClient();
    
    if (!supabaseAdmin) {
      console.warn('Supabase admin client is not properly configured. Skipping bucket creation.');
      return false;
    }

    try {
      // Check if bucket exists using admin client
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return false;
      }

      const bucketExists = buckets?.some((bucket: { name: string; }) => bucket.name === 'member-photos');
      
      if (!bucketExists) {
        // Create bucket using admin client
        console.log('Creating member-photos bucket with admin privileges...');
        const { error: createError } = await supabaseAdmin.storage.createBucket('member-photos', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB limit
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
          return false;
        }
        
        console.log('✅ member-photos bucket created successfully');
      } else {
        console.log('✅ member-photos bucket already exists');
      }

      return true;
    } catch (error) {
      console.error('Error in ensureBucketExists:', error);
      return false;
    }
  }
}
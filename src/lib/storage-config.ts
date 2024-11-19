import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage bucket names
export const STORAGE_BUCKETS = {
  ROAD_IMAGES: 'road-images',
  PROJECT_DOCS: 'project-docs',
  SITE_PHOTOS: 'site-photos',
  EQUIPMENT_IMAGES: 'equipment-images',
} as const

// Helper functions for common storage operations
export const storageHelpers = {
  // Upload a file with progress tracking
  async uploadFile(
    bucket: keyof typeof STORAGE_BUCKETS,
    filePath: string,
    file: File,
    onProgress?: (progress: number) => void
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS[bucket])
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (event) => {
            const progress = (event.loaded / event.total) * 100
            onProgress?.(progress)
          },
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  // Get a public URL for a file
  getPublicUrl(bucket: keyof typeof STORAGE_BUCKETS, filePath: string) {
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  // Create a signed URL that expires
  async createSignedUrl(
    bucket: keyof typeof STORAGE_BUCKETS,
    filePath: string,
    expiresIn: number = 60 // Default 60 seconds
  ) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .createSignedUrl(filePath, expiresIn)

    if (error) throw error
    return data
  },

  // Delete a file
  async deleteFile(bucket: keyof typeof STORAGE_BUCKETS, filePath: string) {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .remove([filePath])

    if (error) throw error
  },

  // List files in a folder
  async listFiles(bucket: keyof typeof STORAGE_BUCKETS, folderPath?: string) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .list(folderPath || '')

    if (error) throw error
    return data
  },
}

// Storage policies
export const STORAGE_POLICIES = {
  // Example policy for road images
  ROAD_IMAGES: `
    CREATE POLICY "Road images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'road-images' AND auth.role() = 'authenticated');
  `,

  // Example policy for project documents
  PROJECT_DOCS: `
    CREATE POLICY "Project docs accessible by project members"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'project-docs'
      AND auth.uid() IN (
        SELECT user_id FROM project_members
        WHERE project_id = (SELECT project_id FROM project_files WHERE file_path = name)
      )
    );
  `,
}

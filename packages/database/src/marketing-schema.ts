export type Model3D = {
  id: string
  name: string
  description?: string
  model_type: '3d_model' | 'rendering' | 'virtual_tour' | 'animation'
  file_path: string
  file_format: 'glb' | 'fbx' | 'obj' | 'usdz'
  thumbnail_path?: string
  metadata?: {
    polyCount?: number
    textureResolution?: string
    fileSize?: number
    dimensions?: {
      width: number
      height: number
      length: number
    }
  }
  version: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export type Rendering = {
  id: string
  model_id: string
  project_id: string
  name: string
  description?: string
  image_path: string
  render_settings?: {
    camera: {
      position: [number, number, number]
      target: [number, number, number]
      fov: number
    }
    lighting?: {
      type: 'hdri' | 'studio' | 'outdoor'
      intensity: number
      color?: string
    }
    materials?: Record<string, unknown>
  }
  thumbnail_path?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type VirtualTour = {
  id: string
  project_id: string
  name: string
  description?: string
  tour_data: {
    waypoints: {
      id: string
      position: [number, number, number]
      rotation: [number, number, number]
      title?: string
      description?: string
    }[]
    hotspots: {
      id: string
      type: 'info' | 'link' | 'media'
      position: [number, number, number]
      content: unknown
    }[]
  }
  thumbnail_path?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export type MarketingAsset = {
  id: string
  project_id: string
  asset_type: '3d_model' | 'rendering' | 'virtual_tour' | 'animation'
  asset_id: string
  name: string
  description?: string
  tags?: string[]
  usage_context?: ('website' | 'presentation' | 'social_media')[]
  created_at: string
  updated_at: string
}

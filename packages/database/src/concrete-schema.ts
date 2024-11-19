export type ConcreteService = {
  id: string
  name: string
  description?: string
  base_price?: number
  price_unit?: 'per_sqft' | 'per_yard' | 'fixed'
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProjectDetails = {
  id: string
  project_id: string
  service_id: string
  area_size?: number
  area_unit?: 'sqft' | 'sqm'
  concrete_type?: string
  finish_type?: string
  reinforcement_type?: string
  special_requirements?: string
  site_conditions?: string
  created_at: string
  updated_at: string
}

export type ProjectTimeline = {
  id: string
  project_id: string
  stage: 'site_prep' | 'forming' | 'pouring' | 'finishing' | 'curing'
  planned_start?: string
  planned_end?: string
  actual_start?: string
  actual_end?: string
  notes?: string
  created_at: string
  updated_at: string
}

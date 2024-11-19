export type Lead = {
  id: string
  name: string
  email?: string
  phone?: string
  service_requested: string
  project_details?: string
  estimated_budget?: number
  preferred_contact_method?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  lead_id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  start_date?: string
  end_date?: string
  budget?: number
  created_at: string
  updated_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: 'lead' | 'project' | 'system'
  read: boolean
  created_at: string
}

export type Content = {
  id: string
  title: string
  content: string
  type: 'page' | 'blog' | 'service'
  seo_keywords: string[]
  meta_description?: string
  published: boolean
  created_at: string
  updated_at: string
}

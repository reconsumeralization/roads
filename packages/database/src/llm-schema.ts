export type LLMPrompt = {
  id: string
  project_id: string
  prompt_text: string
  prompt_embedding?: number[] // OpenAI embedding vector
  context?: {
    temperature?: number
    max_tokens?: number
    stop_sequences?: string[]
    relevant_docs?: string[]
    [key: string]: unknown
  }
  metadata?: {
    source?: string
    category?: string
    tags?: string[]
    [key: string]: unknown
  }
  created_at: string
  updated_at: string
}

export type LLMGeneration = {
  id: string
  prompt_id: string
  project_id: string
  generated_text: string
  generation_embedding?: number[] // OpenAI embedding vector
  model_info: {
    model_name: string
    model_version?: string
    provider: 'openai' | 'anthropic' | 'local'
    parameters?: {
      temperature?: number
      top_p?: number
      frequency_penalty?: number
      presence_penalty?: number
      [key: string]: unknown
    }
  }
  metrics?: {
    tokens_used?: number
    generation_time_ms?: number
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
    [key: string]: unknown
  }
  created_at: string
}

// Helper types for vector similarity search
export type VectorSearchResult = {
  id: string
  similarity: number
  text: string
  metadata?: Record<string, unknown>
}

export type VectorSearchOptions = {
  limit?: number
  threshold?: number
  filter?: {
    project_id?: string
    created_after?: string
    created_before?: string
    [key: string]: unknown
  }
}

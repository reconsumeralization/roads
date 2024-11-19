-- Enable vector extension if not already enabled
create extension if not exists "vector";

-- LLM Prompts table with vector embeddings
create table public.llm_prompts (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references public.projects(id),
    prompt_text text not null,
    prompt_embedding vector(1536), -- For OpenAI embeddings
    context jsonb default '{}'::jsonb, -- Additional context used
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- LLM Generations table with vector embeddings
create table public.llm_generations (
    id uuid primary key default uuid_generate_v4(),
    prompt_id uuid references public.llm_prompts(id),
    project_id uuid references public.projects(id),
    generated_text text not null,
    generation_embedding vector(1536), -- For OpenAI embeddings
    model_info jsonb not null, -- Model name, parameters, etc.
    metrics jsonb default '{}'::jsonb, -- Generation metrics like tokens, time, etc.
    created_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.llm_prompts enable row level security;
alter table public.llm_generations enable row level security;

-- Project-based access policies
create policy "Users can view their project's prompts"
on public.llm_prompts
for select
to authenticated
using (
    project_id in (
        select id from public.projects
        where auth.uid() = user_id
    )
);

create policy "Users can view their project's generations"
on public.llm_generations
for select
to authenticated
using (
    project_id in (
        select id from public.projects
        where auth.uid() = user_id
    )
);

-- Add indexes for vector similarity search
create index on public.llm_prompts
using ivfflat (prompt_embedding vector_cosine_ops)
with (lists = 100);

create index on public.llm_generations
using ivfflat (generation_embedding vector_cosine_ops)
with (lists = 100);

-- Add indexes for common queries
create index idx_llm_prompts_project on public.llm_prompts(project_id);
create index idx_llm_generations_prompt on public.llm_generations(prompt_id);
create index idx_llm_generations_project on public.llm_generations(project_id);

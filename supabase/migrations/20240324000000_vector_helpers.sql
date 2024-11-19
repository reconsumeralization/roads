-- Helper function to calculate cosine similarity between two vectors
create or replace function cosine_similarity(a vector, b vector)
returns float
language plpgsql
immutable
as $$
begin
  return 1 - (a <=> b);
end;
$$;

-- Function to find similar 3D models
create or replace function find_similar_models(
  query_embedding vector,
  similarity_threshold float default 0.8,
  max_results integer default 10
)
returns table (
  id uuid,
  name text,
  similarity float,
  metadata jsonb
)
language plpgsql
stable
as $$
begin
  return query
  select
    m.id,
    m.name,
    cosine_similarity(m.metadata->>'embedding', query_embedding) as similarity,
    m.metadata
  from models_3d m
  where cosine_similarity(m.metadata->>'embedding', query_embedding) > similarity_threshold
  order by similarity desc
  limit max_results;
end;
$$;

-- Function to find similar LLM prompts
create or replace function find_similar_prompts(
  query_text text,
  embedding vector,
  project_id uuid default null,
  similarity_threshold float default 0.8,
  max_results integer default 5
)
returns table (
  id uuid,
  prompt_text text,
  similarity float,
  context jsonb,
  metadata jsonb
)
language plpgsql
stable
as $$
begin
  return query
  select
    p.id,
    p.prompt_text,
    cosine_similarity(p.prompt_embedding, embedding) as similarity,
    p.context,
    p.metadata
  from llm_prompts p
  where
    (project_id is null or p.project_id = project_id)
    and cosine_similarity(p.prompt_embedding, embedding) > similarity_threshold
  order by similarity desc
  limit max_results;
end;
$$;

-- Function to analyze prompt effectiveness
create or replace function analyze_prompt_effectiveness(
  project_id uuid,
  start_date timestamp default '-infinity',
  end_date timestamp default 'infinity'
)
returns table (
  prompt_category text,
  avg_tokens float,
  avg_generation_time float,
  success_rate float,
  total_cost float
)
language plpgsql
stable
as $$
begin
  return query
  select
    p.metadata->>'category' as prompt_category,
    avg((g.metrics->>'total_tokens')::float) as avg_tokens,
    avg((g.metrics->>'generation_time_ms')::float) as avg_generation_time,
    count(case when g.metrics->>'success' = 'true' then 1 end)::float / count(*)::float as success_rate,
    sum((g.metrics->>'total_tokens')::float * 0.0001) as total_cost -- Assuming $0.0001 per token
  from llm_prompts p
  join llm_generations g on p.id = g.prompt_id
  where
    p.project_id = $1
    and g.created_at between $2 and $3
  group by p.metadata->>'category';
end;
$$;

-- Function to get 3D model usage analytics
create or replace function get_model_analytics(
  model_id uuid,
  start_date timestamp default '-infinity',
  end_date timestamp default 'infinity'
)
returns jsonb
language plpgsql
stable
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total_views', count(*),
    'unique_users', count(distinct user_id),
    'avg_view_time', avg(extract(epoch from (end_time - start_time))),
    'popular_angles', jsonb_agg(
      distinct jsonb_build_object(
        'camera_position', r.render_settings->'camera'->>'position',
        'view_count', count(*)
      )
      order by count(*) desc
      limit 5
    )
  )
  into result
  from renderings r
  where
    r.model_id = $1
    and r.created_at between $2 and $3;

  return result;
end;
$$;

-- Add specialized indexes for better performance
create index idx_llm_prompts_embedding_category on llm_prompts
using gin ((metadata->>'category'));

create index idx_llm_generations_metrics on llm_generations
using gin (metrics);

create index idx_models_3d_metadata on models_3d
using gin (metadata);

-- Add materialized view for common analytics queries
create materialized view prompt_analytics as
select
  date_trunc('day', p.created_at) as day,
  p.metadata->>'category' as category,
  count(*) as prompt_count,
  avg((g.metrics->>'total_tokens')::float) as avg_tokens,
  avg((g.metrics->>'generation_time_ms')::float) as avg_generation_time
from llm_prompts p
join llm_generations g on p.id = g.prompt_id
group by 1, 2;

-- Refresh function for materialized view
create or replace function refresh_prompt_analytics()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view prompt_analytics;
end;
$$;

-- Create a trigger to automatically refresh the materialized view
create or replace function trigger_refresh_prompt_analytics()
returns trigger
language plpgsql
security definer
as $$
begin
  perform refresh_prompt_analytics();
  return null;
end;
$$;

create trigger refresh_prompt_analytics_trigger
after insert or update or delete
on llm_generations
for each statement
execute function trigger_refresh_prompt_analytics();

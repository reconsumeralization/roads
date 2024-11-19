-- Enable necessary extensions if not already enabled
create extension if not exists "postgis";
create extension if not exists "plpgsql";

-- Helper function to calculate asphalt volume
create or replace function calculate_asphalt_volume(
  length_meters decimal,
  width_meters decimal,
  depth_meters decimal
)
returns decimal
language plpgsql
immutable
as $$
begin
  return length_meters * width_meters * depth_meters;
end;
$$;

-- Helper function to calculate gravel volume
create or replace function calculate_gravel_volume(
  length_meters decimal,
  width_meters decimal,
  depth_meters decimal
)
returns decimal
language plpgsql
immutable
as $$
begin
  return length_meters * width_meters * depth_meters;
end;
$$;

-- Function to estimate workers needed
create or replace function estimate_workers(
  project_size_sqm decimal,
  duration_days integer,
  worker_productivity decimal default 50 -- sqm per worker per day
)
returns integer
language plpgsql
immutable
as $$
begin
  return ceil((project_size_sqm / duration_days) / worker_productivity);
end;
$$;

-- Function to calculate material costs
create or replace function calculate_material_cost(
  asphalt_volume decimal,
  gravel_volume decimal,
  asphalt_cost_per_m3 decimal,
  gravel_cost_per_m3 decimal
)
returns decimal
language plpgsql
immutable
as $$
begin
  return (asphalt_volume * asphalt_cost_per_m3) + (gravel_volume * gravel_cost_per_m3);
end;
$$;

-- Function to estimate total project cost
create or replace function estimate_project_cost(
  length_meters decimal,
  width_meters decimal,
  asphalt_depth decimal,
  gravel_depth decimal,
  duration_days integer,
  asphalt_cost_per_m3 decimal default 100,
  gravel_cost_per_m3 decimal default 50,
  labor_cost_per_day decimal default 200
)
returns jsonb
language plpgsql
stable
as $$
declare
  asphalt_volume decimal;
  gravel_volume decimal;
  material_cost decimal;
  labor_count integer;
  labor_cost decimal;
  total_cost decimal;
begin
  -- Calculate volumes
  asphalt_volume := calculate_asphalt_volume(length_meters, width_meters, asphalt_depth);
  gravel_volume := calculate_gravel_volume(length_meters, width_meters, gravel_depth);

  -- Calculate material costs
  material_cost := calculate_material_cost(
    asphalt_volume,
    gravel_volume,
    asphalt_cost_per_m3,
    gravel_cost_per_m3
  );

  -- Calculate labor costs
  labor_count := estimate_workers(length_meters * width_meters, duration_days);
  labor_cost := labor_count * duration_days * labor_cost_per_day;

  -- Calculate total cost
  total_cost := material_cost + labor_cost;

  -- Return detailed breakdown
  return jsonb_build_object(
    'asphalt_volume', asphalt_volume,
    'gravel_volume', gravel_volume,
    'material_cost', material_cost,
    'labor_count', labor_count,
    'labor_cost', labor_cost,
    'total_cost', total_cost
  );
end;
$$;

-- Function to calculate road area with PostGIS
create or replace function calculate_road_area(
  road_geometry geometry
)
returns decimal
language plpgsql
immutable
as $$
begin
  return ST_Area(road_geometry);
end;
$$;

-- Add indexes for performance
create index if not exists idx_projects_status
on projects(status);

create index if not exists idx_projects_start_date
on projects(start_date);

create index if not exists idx_projects_status_start_date
on projects(status, start_date);

create index if not exists idx_materials_type
on materials(type);

create index if not exists idx_workers_skill
on workers(skill);

create index if not exists idx_projects_name
on projects using gin(to_tsvector('english', name));

create index if not exists idx_materials_project_id
on materials(project_id);

create index if not exists idx_project_workers_project_id
on project_workers(project_id);

create index if not exists idx_project_workers_worker_id
on project_workers(worker_id);

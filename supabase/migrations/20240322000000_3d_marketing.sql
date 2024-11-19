-- Enable necessary extensions
create extension if not exists "postgis";
create extension if not exists "ltree";

-- 3D Models table
create table public.models_3d (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    model_type text not null, -- 'road', 'intersection', 'bridge', etc.
    file_path text not null,
    file_format text not null, -- 'glb', 'fbx', 'obj', etc.
    thumbnail_path text,
    metadata jsonb default '{}'::jsonb,
    version integer default 1,
    is_public boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Renderings table
create table public.renderings (
    id uuid primary key default uuid_generate_v4(),
    model_id uuid references public.models_3d(id),
    project_id uuid references public.projects(id),
    name text not null,
    description text,
    image_path text not null,
    render_settings jsonb default '{}'::jsonb, -- camera position, lighting, materials
    thumbnail_path text,
    is_featured boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Virtual Tours table
create table public.virtual_tours (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references public.projects(id),
    name text not null,
    description text,
    tour_data jsonb not null, -- waypoints, hotspots, etc.
    thumbnail_path text,
    is_public boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Marketing Assets table
create table public.marketing_assets (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references public.projects(id),
    asset_type text not null, -- '3d_model', 'rendering', 'virtual_tour', 'animation'
    asset_id uuid not null, -- references the specific asset table
    name text not null,
    description text,
    tags text[],
    usage_context text[], -- 'website', 'presentation', 'social_media'
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.models_3d enable row level security;
alter table public.renderings enable row level security;
alter table public.virtual_tours enable row level security;
alter table public.marketing_assets enable row level security;

-- Public access policies
create policy "Allow public access to public 3D models"
on public.models_3d
for select
to public
using (is_public = true);

create policy "Allow public access to public virtual tours"
on public.virtual_tours
for select
to public
using (is_public = true);

-- Authenticated user policies
create policy "Allow authenticated users to view all 3D models"
on public.models_3d
for select
to authenticated
using (true);

create policy "Allow authenticated users to manage their project's renderings"
on public.renderings
for all
to authenticated
using (
    project_id in (
        select id from public.projects
        where auth.uid() = user_id
    )
);

-- Add indexes for performance
create index idx_models_3d_type on public.models_3d(model_type);
create index idx_renderings_project on public.renderings(project_id);
create index idx_marketing_assets_type on public.marketing_assets(asset_type);
create index idx_marketing_assets_tags on public.marketing_assets using gin(tags);

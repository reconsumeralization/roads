-- Concrete Services table
create table public.concrete_services (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    base_price decimal,
    price_unit text, -- e.g., 'per_sqft', 'per_yard'
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Project Details table (extends projects table)
create table public.project_details (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references public.projects(id),
    service_id uuid references public.concrete_services(id),
    area_size decimal,
    area_unit text, -- 'sqft', 'sqm'
    concrete_type text,
    finish_type text,
    reinforcement_type text,
    special_requirements text,
    site_conditions text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Project Timeline table
create table public.project_timeline (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references public.projects(id),
    stage text not null, -- 'site_prep', 'forming', 'pouring', 'finishing', 'curing'
    planned_start timestamp with time zone,
    planned_end timestamp with time zone,
    actual_start timestamp with time zone,
    actual_end timestamp with time zone,
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.concrete_services enable row level security;
alter table public.project_details enable row level security;
alter table public.project_timeline enable row level security;

-- Add triggers for updated_at
create trigger handle_concrete_services_updated_at
    before update on public.concrete_services
    for each row execute function public.handle_updated_at();

create trigger handle_project_details_updated_at
    before update on public.project_details
    for each row execute function public.handle_updated_at();

create trigger handle_project_timeline_updated_at
    before update on public.project_timeline
    for each row execute function public.handle_updated_at();

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Leads table
create table public.leads (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    email text,
    phone text,
    service_requested text not null,
    project_details text,
    estimated_budget decimal,
    preferred_contact_method text,
    status text default 'new',
    priority text default 'normal',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Projects table
create table public.projects (
    id uuid primary key default uuid_generate_v4(),
    lead_id uuid references public.leads(id),
    name text not null,
    status text default 'pending',
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    budget decimal,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Notifications table
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    title text not null,
    message text not null,
    type text not null,
    read boolean default false,
    created_at timestamp with time zone default now()
);

-- Content table
create table public.content (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    content text not null,
    type text not null,
    seo_keywords text[],
    meta_description text,
    published boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.leads enable row level security;
alter table public.projects enable row level security;
alter table public.notifications enable row level security;
alter table public.content enable row level security;

-- Create RLS policies
create policy "Enable read access for authenticated users" on public.leads
    for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on public.leads
    for insert with check (auth.role() = 'authenticated');

-- Add updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger handle_leads_updated_at
    before update on public.leads
    for each row execute function public.handle_updated_at();

create trigger handle_projects_updated_at
    before update on public.projects
    for each row execute function public.handle_updated_at();

create trigger handle_content_updated_at
    before update on public.content
    for each row execute function public.handle_updated_at();

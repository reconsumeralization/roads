-- Helper function to check if user is admin
create or replace function auth.is_admin()
returns boolean as $$
begin
  return (
    select coalesce(
      auth.jwt() ->> 'role' = 'admin',
      false
    )
  );
end;
$$ language plpgsql security definer;

-- Concrete Services Policies
create policy "Anyone can view active concrete services"
on public.concrete_services
for select
to authenticated
using (
  is_active = true or auth.is_admin()
);

create policy "Only admins can modify concrete services"
on public.concrete_services
for all
to authenticated
using (auth.is_admin())
with check (auth.is_admin());

-- Project Details Policies
create policy "Users can view their project details"
on public.project_details
for select
to authenticated
using (
  project_id in (
    select id from public.projects
    where (select auth.uid()) = user_id
  )
);

create policy "Users can create project details for their projects"
on public.project_details
for insert
to authenticated
with check (
  project_id in (
    select id from public.projects
    where (select auth.uid()) = user_id
  )
);

create policy "Users can update their project details"
on public.project_details
for update
to authenticated
using (
  project_id in (
    select id from public.projects
    where (select auth.uid()) = user_id
  )
)
with check (
  project_id in (
    select id from public.projects
    where (select auth.uid()) = user_id
  )
);

-- Project Timeline Policies
create policy "Users can view their project timelines"
on public.project_timeline
for select
to authenticated
using (
  project_id in (
    select id from public.projects
    where (select auth.uid()) = user_id
  )
);

create policy "Users can create timeline entries for their projects"
on public.project_timeline
for insert
to authenticated
with check (
  project_id in (
    select id from public.projects
    where (select auth.uid()) = user_id
  )
);

create policy "Users can update their project timelines"
on public.project_timeline
for update
to authenticated
using (
  project_id in (
    select id from public.projects
    where (select auth.uid()) = user_id
  )
)
with check (
  project_id in (
    select id from public.projects
    where (select auth.uid()) = user_id
  )
);

-- Add indexes for better RLS performance
create index if not exists project_details_project_id_idx
on public.project_details(project_id);

create index if not exists project_timeline_project_id_idx
on public.project_timeline(project_id);

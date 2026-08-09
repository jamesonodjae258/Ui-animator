-- Stage 3: Projects table
-- Stores project metadata. Frames reference this via project_id.

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  brief text not null default '',
  figma_file_key text,
  style_preset text not null default 'clean_saas',
  duration_seconds integer not null default 30,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;

drop policy if exists "Users can read own projects" on projects;
create policy "Users can read own projects"
  on projects for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own projects" on projects;
create policy "Users can insert own projects"
  on projects for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own projects" on projects;
create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own projects" on projects;
create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = user_id);

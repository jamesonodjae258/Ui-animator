-- ================================================================
-- UI ANIMATOR CONSOLIDATED SUPABASE SCHEMA
-- Paste and run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ================================================================

-- 1. Projects table
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

-- 2. Figma OAuth Connection table (encrypted tokens at rest)
create table if not exists figma_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  encrypted_access_token text not null,
  encrypted_refresh_token text not null,
  token_iv text not null,
  refresh_iv text not null,
  expires_at timestamptz not null,
  figma_user_name text,
  figma_user_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table figma_connections enable row level security;

drop policy if exists "Users can read own figma connection" on figma_connections;
create policy "Users can read own figma connection"
  on figma_connections for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own figma connection" on figma_connections;
create policy "Users can insert own figma connection"
  on figma_connections for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own figma connection" on figma_connections;
create policy "Users can update own figma connection"
  on figma_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own figma connection" on figma_connections;
create policy "Users can delete own figma connection"
  on figma_connections for delete
  using (auth.uid() = user_id);

-- 3. Frames table
create table if not exists frames (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  figma_node_id text not null,
  name text not null,
  order_in_flow integer not null default 0,
  thumbnail_storage_path text,
  included boolean not null default true,
  created_at timestamptz not null default now()
);

alter table frames enable row level security;

drop policy if exists "Users can read frames in own projects" on frames;
create policy "Users can read frames in own projects"
  on frames for select
  using (
    exists (
      select 1 from projects
      where projects.id = frames.project_id
        and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert frames in own projects" on frames;
create policy "Users can insert frames in own projects"
  on frames for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = frames.project_id
        and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update frames in own projects" on frames;
create policy "Users can update frames in own projects"
  on frames for update
  using (
    exists (
      select 1 from projects
      where projects.id = frames.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from projects
      where projects.id = frames.project_id
        and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete frames in own projects" on frames;
create policy "Users can delete frames in own projects"
  on frames for delete
  using (
    exists (
      select 1 from projects
      where projects.id = frames.project_id
        and projects.user_id = auth.uid()
    )
  );

-- 4. Storage bucket for frame thumbnails
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'frame-thumbnails',
  'frame-thumbnails',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg']
)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload thumbnails" on storage.objects;
create policy "Authenticated users can upload thumbnails"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'frame-thumbnails');

drop policy if exists "Anyone can view thumbnails" on storage.objects;
create policy "Anyone can view thumbnails"
  on storage.objects for select
  to public
  using (bucket_id = 'frame-thumbnails');

drop policy if exists "Authenticated users can delete thumbnails" on storage.objects;
create policy "Authenticated users can delete thumbnails"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'frame-thumbnails');

-- 5. Scene graphs table
create table if not exists scene_graphs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  video_duration_target integer not null default 30,
  style_preset text not null default 'clean_saas',
  status text not null default 'generating',
  error_message text,
  shots jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table scene_graphs enable row level security;

drop policy if exists "Users can read scene_graphs in own projects" on scene_graphs;
create policy "Users can read scene_graphs in own projects"
  on scene_graphs for select
  using (
    exists (
      select 1 from projects
      where projects.id = scene_graphs.project_id
        and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert scene_graphs in own projects" on scene_graphs;
create policy "Users can insert scene_graphs in own projects"
  on scene_graphs for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = scene_graphs.project_id
        and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update scene_graphs in own projects" on scene_graphs;
create policy "Users can update scene_graphs in own projects"
  on scene_graphs for update
  using (
    exists (
      select 1 from projects
      where projects.id = scene_graphs.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from projects
      where projects.id = scene_graphs.project_id
        and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete scene_graphs in own projects" on scene_graphs;
create policy "Users can delete scene_graphs in own projects"
  on scene_graphs for delete
  using (
    exists (
      select 1 from projects
      where projects.id = scene_graphs.project_id
        and projects.user_id = auth.uid()
    )
  );

-- 6. Render jobs table and rendered-videos storage bucket
create table if not exists render_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scene_graph_id uuid not null references scene_graphs(id) on delete cascade,
  status text not null default 'queued',
  output_video_url text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table render_jobs enable row level security;

drop policy if exists "Users can read render_jobs in own projects" on render_jobs;
create policy "Users can read render_jobs in own projects"
  on render_jobs for select
  using (
    exists (
      select 1 from projects
      where projects.id = render_jobs.project_id
        and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert render_jobs in own projects" on render_jobs;
create policy "Users can insert render_jobs in own projects"
  on render_jobs for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = render_jobs.project_id
        and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update render_jobs in own projects" on render_jobs;
create policy "Users can update render_jobs in own projects"
  on render_jobs for update
  using (
    exists (
      select 1 from projects
      where projects.id = render_jobs.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from projects
      where projects.id = render_jobs.project_id
        and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete render_jobs in own projects" on render_jobs;
create policy "Users can delete render_jobs in own projects"
  on render_jobs for delete
  using (
    exists (
      select 1 from projects
      where projects.id = render_jobs.project_id
        and projects.user_id = auth.uid()
    )
  );

-- Create public storage bucket for rendered MP4 videos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rendered-videos',
  'rendered-videos',
  true,
  104857600, -- 100 MB
  array['video/mp4']
)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload rendered videos" on storage.objects;
create policy "Authenticated users can upload rendered videos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'rendered-videos');

drop policy if exists "Anyone can view rendered videos" on storage.objects;
create policy "Anyone can view rendered videos"
  on storage.objects for select
  to public
  using (bucket_id = 'rendered-videos');

drop policy if exists "Authenticated users can delete rendered videos" on storage.objects;
create policy "Authenticated users can delete rendered videos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'rendered-videos');

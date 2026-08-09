-- Stage 5: Render jobs table and rendered-videos storage bucket
-- Stores video render job status, progress, and output URLs.

create table if not exists render_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scene_graph_id uuid not null references scene_graphs(id) on delete cascade,
  status text not null default 'queued', -- queued | rendering | complete | failed
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

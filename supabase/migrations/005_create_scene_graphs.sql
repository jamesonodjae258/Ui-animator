-- Stage 4: Scene graphs table
-- Stores LLM-generated narrative shot plans for projects.

create table if not exists scene_graphs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  video_duration_target integer not null default 30,
  style_preset text not null default 'clean_saas',
  status text not null default 'generating', -- generating | ready | error
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

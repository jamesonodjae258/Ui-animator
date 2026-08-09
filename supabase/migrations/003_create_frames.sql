-- Stage 3: Frames table
-- Stores imported Figma frames. RLS scoped via project ownership.

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

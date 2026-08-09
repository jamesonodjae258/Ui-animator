-- Stage 3: Figma OAuth token storage
-- Tokens are encrypted at the application level before insert.
-- Each user has at most one Figma connection (user_id is unique).

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

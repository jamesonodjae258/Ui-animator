-- Stage 3: Storage bucket for frame thumbnails
-- Public read so thumbnails can be displayed in the UI without signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'frame-thumbnails',
  'frame-thumbnails',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg']
)
on conflict (id) do nothing;

-- Authenticated users can upload thumbnails
drop policy if exists "Authenticated users can upload thumbnails" on storage.objects;
create policy "Authenticated users can upload thumbnails"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'frame-thumbnails');

-- Anyone can view thumbnails (bucket is public)
drop policy if exists "Anyone can view thumbnails" on storage.objects;
create policy "Anyone can view thumbnails"
  on storage.objects for select
  to public
  using (bucket_id = 'frame-thumbnails');

-- Authenticated users can delete their uploaded thumbnails
drop policy if exists "Authenticated users can delete thumbnails" on storage.objects;
create policy "Authenticated users can delete thumbnails"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'frame-thumbnails');

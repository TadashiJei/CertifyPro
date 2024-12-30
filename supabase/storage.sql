-- Enable storage
create policy "Enable storage for authenticated users" on storage.objects
  for all
  to authenticated
  using (bucket_id = 'certificates' and auth.role() = 'authenticated');

-- Enable public access to certificates bucket
create policy "Public Access" on storage.objects
  for select
  to public
  using (bucket_id = 'certificates');

-- Allow authenticated users to upload to certificates bucket
create policy "Allow uploads to certificates bucket" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'certificates');

-- Allow users to update their own objects
create policy "Allow update own objects" on storage.objects
  for update
  to authenticated
  using (auth.uid() = owner);

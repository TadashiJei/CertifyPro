-- Create storage bucket for template images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('template-images', 'template-images', false)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Create policies for template-images bucket
create policy "Allow authenticated users to upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'template-images' AND
  auth.uid() = owner
);

create policy "Allow authenticated users to read their own images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'template-images' AND
  auth.uid() = owner
);

create policy "Allow authenticated users to update their own images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'template-images' AND
  auth.uid() = owner
);

create policy "Allow authenticated users to delete their own images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'template-images' AND
  auth.uid() = owner
);

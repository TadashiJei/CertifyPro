-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the certificates bucket
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'certificates'
        AND (storage.foldername(name))[1] = 'template-images'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'certificates' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'certificates' AND owner = auth.uid());

CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'certificates' AND owner = auth.uid());

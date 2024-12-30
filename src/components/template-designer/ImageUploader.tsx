import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const ensureBucketExists = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const certificatesBucket = buckets?.find(b => b.name === 'certificates');
      
      if (!certificatesBucket) {
        const { error } = await supabase.storage.createBucket('certificates', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2, // 2MB
        });
        
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Error ensuring bucket exists:', error);
      // Continue anyway as the bucket might exist but we might not have permission to list buckets
    }
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file.');
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size should be less than 2MB.');
      }

      // Ensure bucket exists
      await ensureBucketExists();

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `template-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('certificates')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      if (!data) {
        throw new Error('Upload failed - no data returned');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error uploading image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Input
          type="file"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
          className="cursor-pointer"
        />
        <p className="text-sm text-gray-500">
          Supported formats: JPG, PNG, GIF (max 2MB)
        </p>
      </div>
      {uploading && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecipientData {
  name: string;
  email: string;
  [key: string]: string;
}

export const DataIntegration = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFile(file);
  };

  const processCSV = async (text: string): Promise<RecipientData[]> => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(value => value.trim());
        const data: RecipientData = { name: '', email: '' };
        
        headers.forEach((header, index) => {
          data[header.toLowerCase()] = values[index] || '';
        });
        
        return data;
      });
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file first',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const text = await file.text();
      const recipientData = await processCSV(text);

      const { error } = await supabase
        .from('certificates')
        .insert(
          recipientData.map(data => ({
            recipient_data: data,
            status: 'pending',
            user_id: 'current-user-id', // Replace with actual user ID from auth
          }))
        );

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Data uploaded successfully',
      });

      setFile(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process and upload data',
        variant: 'destructive',
      });
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <p className="text-sm text-gray-500">
              Upload a CSV file with recipient data (must include name and email columns)
            </p>
          </div>
          
          {file && (
            <div className="flex items-center gap-2">
              <span className="text-sm">{file.name}</span>
              <Button 
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

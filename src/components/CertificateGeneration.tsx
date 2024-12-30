import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const CertificateGeneration = () => {
  const [templates, setTemplates] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('templates')
      .select('*');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch templates',
        variant: 'destructive',
      });
      return;
    }
    setTemplates(data);
  };

  const fetchCertificates = async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch certificates',
        variant: 'destructive',
      });
      return;
    }
    setCertificates(data);
  };

  const generateCertificate = async (templateId: string) => {
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        template_id: templateId,
        status: 'pending',
        recipient_data: {},
        user_id: 'current-user-id' // Replace with actual user ID from auth
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate certificate',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Certificate generation started',
    });
    
    fetchCertificates();
  };

  useEffect(() => {
    fetchTemplates();
    fetchCertificates();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Certificate Generation</h2>
      
      <div className="grid gap-4">
        <h3 className="text-xl">Available Templates</h3>
        {templates.map((template: any) => (
          <div key={template.id} className="flex items-center justify-between p-4 border rounded">
            <div>
              <h4 className="font-medium">{template.name}</h4>
              <p className="text-sm text-gray-500">{template.description}</p>
            </div>
            <Button onClick={() => generateCertificate(template.id)}>
              Generate Certificate
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        <h3 className="text-xl">Generated Certificates</h3>
        {certificates.map((cert: any) => (
          <div key={cert.id} className="p-4 border rounded">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Certificate ID: {cert.id}</p>
                <p className="text-sm text-gray-500">Status: {cert.status}</p>
              </div>
              <Button variant="outline">Download</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary">Certi Creator</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/templates" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                My Templates
              </Link>
              <Link 
                to="/create" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Create Template
              </Link>
              <Link 
                to="/data-integration" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Data Integration
              </Link>
              <Link 
                to="/certificate-generation" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Generate Certificates
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CertificateList = () => {
  const { toast } = useToast();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          templates:templates(name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load certificates",
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("certificates").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Certificate deleted successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Your Certificates</h2>

      {certificates?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No certificates yet</h3>
          <p className="mt-2 text-gray-500">
            Create a template first, then generate certificates from it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates?.map((certificate) => (
            <div
              key={certificate.id}
              className="border rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-medium">
                {certificate.templates?.name}
              </h3>
              <p className="text-gray-500">
                Status: <span className="capitalize">{certificate.status}</span>
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(certificate.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
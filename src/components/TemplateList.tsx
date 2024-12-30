import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PlusCircle, FileEdit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export const TemplateList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load templates",
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("templates").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Template deleted successfully",
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Templates</h2>
        <Button onClick={() => navigate("/templates/create")} className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Create Template
        </Button>
      </div>

      {templates?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No templates yet</h3>
          <p className="mt-2 text-gray-500">Get started by creating your first template.</p>
          <Button
            onClick={() => navigate("/templates/create")}
            className="mt-4"
            variant="outline"
          >
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-medium">{template.name}</h3>
              <p className="text-gray-500">{template.description}</p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                >
                  <FileEdit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
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
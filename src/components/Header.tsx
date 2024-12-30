import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { User, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/login");
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 
            className="text-2xl font-bold text-primary cursor-pointer" 
            onClick={() => navigate("/")}
          >
            CertifyPro
          </h1>
        </div>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                onClick={() => navigate("/templates/new")}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate("/login")}>
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
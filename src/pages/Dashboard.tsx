import { Header } from "@/components/Header";
import { TemplateList } from "@/components/TemplateList";
import { CertificateList } from "@/components/CertificateList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <Tabs defaultValue="templates" className="w-full">
          <TabsList>
            <TabsTrigger value="templates">My Templates</TabsTrigger>
            <TabsTrigger value="certificates">My Certificates</TabsTrigger>
          </TabsList>
          <TabsContent value="templates">
            <TemplateList />
          </TabsContent>
          <TabsContent value="certificates">
            <CertificateList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
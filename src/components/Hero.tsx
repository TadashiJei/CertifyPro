import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 animate-fadeIn text-slate-900">
          Create Beautiful Certificates in Minutes
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto animate-fadeIn">
          Design professional certificates with our easy-to-use platform. Import your data,
          customize your template, and generate certificates in bulk.
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate("/create")}
          >
            Start Creating
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/templates")}
          >
            View Templates
          </Button>
        </div>
      </div>
    </div>
  );
};
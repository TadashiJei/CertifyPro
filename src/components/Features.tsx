import { 
  LayoutTemplate, 
  FileSpreadsheet, 
  Download, 
  Wand2 
} from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: <LayoutTemplate className="w-12 h-12 text-primary" />,
      title: "Drag & Drop Designer",
      description: "Create stunning certificates with our intuitive drag and drop interface",
    },
    {
      icon: <FileSpreadsheet className="w-12 h-12 text-primary" />,
      title: "CSV Import",
      description: "Import recipient data from CSV files for bulk certificate generation",
    },
    {
      icon: <Wand2 className="w-12 h-12 text-primary" />,
      title: "Smart Templates",
      description: "Start with our pre-built templates or create your own from scratch",
    },
    {
      icon: <Download className="w-12 h-12 text-primary" />,
      title: "Multiple Formats",
      description: "Export your certificates in PDF, DOCX, or PPT formats",
    },
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Create Professional Certificates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 text-center rounded-lg border hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
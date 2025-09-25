import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, File, FileSpreadsheet } from "lucide-react";

interface ExportButtonProps {
  data: any[];
  filename: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export const ExportButton = ({ data, filename, variant = "outline", size = "default" }: ExportButtonProps) => {
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    // Simple export functionality - can be enhanced later
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border border-border shadow-lg">
        <DropdownMenuItem 
          onClick={() => handleExport("csv")}
          className="hover:bg-muted cursor-pointer"
        >
          <File className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport("excel")}
          className="hover:bg-muted cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport("pdf")}
          className="hover:bg-muted cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

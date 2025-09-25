import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, File, FileSpreadsheet } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/adminDataSync";

interface ExportButtonProps {
  data: any[];
  filename: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export const ExportButton = ({ data, filename, variant = "outline", size = "default" }: ExportButtonProps) => {
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    switch (format) {
      case "csv":
        exportToCSV(data, filename);
        break;
      case "excel":
        exportToExcel(data, filename);
        break;
      case "pdf":
        exportToPDF(data, filename);
        break;
    }
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
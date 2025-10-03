import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileImage, CheckCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadStepProps {
  initialData?: any;
  email?: string; // Add email prop
  onComplete: (data: any) => void;
  onBack: () => void;
}

export const DocumentUploadStep = ({ initialData, email, onComplete, onBack }: DocumentUploadStepProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState({
    ageProofDocument: initialData?.ageProofDocument || null as File | null,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
    
    // Clear previous errors
    setErrors([]);
    
    // Validate file size immediately if file is selected
    if (file && file.size > 10 * 1024 * 1024) { // 10MB in bytes
      setErrors(["Age Proof Document must be 10MB or less"]);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!files.ageProofDocument) {
      newErrors.push("Age Proof Document is required");
    } else if (files.ageProofDocument.size > 10 * 1024 * 1024) { // 10MB in bytes
      newErrors.push("Age Proof Document must be 10MB or less");
    }
    
    // Validate file types
    if (files.ageProofDocument && !isValidDocumentFile(files.ageProofDocument)) {
      newErrors.push("Age Proof Document must be JPG, PNG, JPEG, or PDF format");
    }
    
    return newErrors;
  };

  const isValidDocumentFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    
    const hasValidType = allowedTypes.includes(file.type.toLowerCase());
    const hasValidExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    return hasValidType || hasValidExtension;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      // Use the new document upload API with actual file upload
      const response = await apiService.uploadDocuments(
        email || initialData?.email,
        files.ageProofDocument || undefined
      );
      
      if (response.data && (response.data as any).success) {
        // Save registration progress
        const progressData = {
          email: email || initialData?.email,
          documents: files,
          current_phase: 2,
          completed_phases: [1, 2],
          is_completed: false
        };
        
        await apiService.saveStudentRegistrationProgress(progressData);
        
        toast({
          title: "Documents Uploaded! ✅",
          description: "Your documents have been uploaded successfully.",
        });
        
        onComplete(files);
      } else {
        throw new Error((response.data && (response.data as any).message) || "Failed to upload documents");
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast({
        title: "Error Uploading Documents",
        description: error instanceof Error ? error.message : "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
      setErrors(["Failed to upload documents. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Document Upload</CardTitle>
          <CardDescription>
            Please upload the required documents. Files should be clear and readable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Age Proof Document Upload */}
          <div className="space-y-6 mt-8">
            <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-smooth">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {files.ageProofDocument ? (
                      <CheckCircle className="h-6 w-6 text-accent" />
                    ) : (
                      <Upload className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor="ageProof" className="text-base font-medium cursor-pointer">
                    Age Proof Document <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Birth certificate, passport, or similar official document
                  </p>
                  <Input
                    id="ageProof"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleFileChange("ageProofDocument", e.target.files?.[0] || null)}
                    className="mt-3"
                  />
                  <div className="mt-2 flex items-center space-x-2 text-sm">
                    <FileImage className="h-4 w-4 text-muted-foreground" />
                    {files.ageProofDocument ? (
                      <>
                        <span className="text-accent font-medium">{files.ageProofDocument.name}</span>
                        <span className="text-muted-foreground">({formatFileSize(files.ageProofDocument.size)})</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Document not selected</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: JPG, PNG, JPEG, PDF • Max size: 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <FileImage className="h-4 w-4" />
            <AlertDescription>
              <strong>Document Guidelines:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Accepted formats: JPG, PNG, JPEG, and PDF files</li>
                <li>• Ensure documents are clear and all text is readable</li>
                <li>• Photos should be well-lit with no shadows or glare</li>
                <li>• Full document should be visible in the image</li>
                <li>• Files will be securely stored and only used for verification</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save and Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
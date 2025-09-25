import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Calculator, Ticket, Database } from "lucide-react";
import { FeeManagement } from "@/components/FeeManagement";
import { ParentPassManagement } from "@/components/ParentPassManagement";
import { DocumentUploadStep } from "@/components/registration/DocumentUploadStep";

export const NewFeaturesDemo = () => {
  const [calculatedFee, setCalculatedFee] = useState<number | null>(null);
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<any>(null);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🚀 New Features Demo</h1>
        <p className="text-gray-600">
          Explore the enhanced functionality with document upload, fee management, and parent pass system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Database</h3>
            <p className="text-sm text-gray-600">5 New Tables</p>
            <Badge variant="secondary" className="mt-1">Enhanced</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Documents</h3>
            <p className="text-sm text-gray-600">File Upload</p>
            <Badge variant="secondary" className="mt-1">New</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calculator className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">Fee Rules</h3>
            <p className="text-sm text-gray-600">Dynamic Pricing</p>
            <Badge variant="secondary" className="mt-1">New</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Ticket className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-semibold">Parent Passes</h3>
            <p className="text-sm text-gray-600">Pass Management</p>
            <Badge variant="secondary" className="mt-1">New</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Document Upload</TabsTrigger>
          <TabsTrigger value="fees">Fee Management</TabsTrigger>
          <TabsTrigger value="passes">Parent Passes</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📄 Document Upload System</CardTitle>
              <CardDescription>
                Upload student ID and age proof documents with proper file handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploadStep
                email="demo@example.com"
                onComplete={(data) => {
                  setUploadedDocuments(data);
                  console.log("Documents uploaded:", data);
                }}
                onBack={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>💰 Fee Management System</CardTitle>
              <CardDescription>
                Dynamic fee calculation based on sport and discipline count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeeManagement onFeeCalculated={setCalculatedFee} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🎫 Parent Pass Management</CardTitle>
              <CardDescription>
                Manage parent passes with different pricing tiers and categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ParentPassManagement onPassSelected={setSelectedPass} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 Integration Summary</CardTitle>
              <CardDescription>
                Overview of all selected options and calculated values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">📄 Documents</h4>
                  {uploadedDocuments ? (
                    <div className="space-y-1">
                      <Badge variant="outline">✅ Student ID Uploaded</Badge>
                      <Badge variant="outline">✅ Age Proof Uploaded</Badge>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No documents uploaded</p>
                  )}
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">💰 Fee Calculation</h4>
                  {calculatedFee ? (
                    <div className="space-y-1">
                      <Badge variant="outline">✅ Fee Calculated</Badge>
                      <p className="text-lg font-bold">₹{calculatedFee}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No fee calculated</p>
                  )}
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">🎫 Parent Pass</h4>
                  {selectedPass ? (
                    <div className="space-y-1">
                      <Badge variant="outline">✅ Pass Selected</Badge>
                      <p className="text-sm">{selectedPass.pass_type}</p>
                      <p className="text-lg font-bold">₹{selectedPass.amount}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No pass selected</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">🔧 Technical Implementation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium">Backend APIs Added:</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>/documents/upload-documents</li>
                      <li>/fees/fee-rules</li>
                      <li>/fees/calculate-fee</li>
                      <li>/parent-passes</li>
                      <li>/parent-passes/current-pricing</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium">Database Tables:</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>documents</li>
                      <li>fee_rules</li>
                      <li>parent_passes</li>
                      <li>payment_requests_institute</li>
                      <li>students_documents</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

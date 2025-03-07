"use client";

import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Define the schema for the import form
const importFormSchema = z.object({
  file: z.instanceof(File, { message: "Please select a file to import" })
    .refine(file => file.size <= 5 * 1024 * 1024, {
      message: "File size must be less than 5MB"
    })
    .refine(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['csv', 'xlsx', 'json'].includes(ext || '');
    }, {
      message: "File must be CSV, Excel (XLSX), or JSON format"
    })
});

type ImportFormValues = z.infer<typeof importFormSchema>;

// Define the type of import
type ImportType = "rides" | "expenses" | "vehicles";

// Define the state for the preview data
type PreviewData = {
  headers: string[];
  rows: Record<string, string>[];
  validRows: number;
  invalidRows: number;
  errors: { row: number; column: string; message: string }[];
};

export function DataImportForm() {
  const [importType, setImportType] = useState<ImportType>("rides");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'preview'>('idle');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {}
  });

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("file", file);
      // Trigger validation after setting the value
      form.trigger("file");
    }
  };

  // Handle form submission
  const onSubmit = async (values: ImportFormValues) => {
    setIsUploading(true);
    setUploadStatus('idle');

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', values.file);
      formData.append('type', importType);

      // Send the file to the server for validation
      const response = await fetch('/api/import/validate', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error validating file');
      }

      // Set the preview data and update status
      setPreviewData(data.data);
      setUploadStatus('preview');

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import file",
        variant: "destructive"
      });
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle confirm import
  const handleConfirmImport = async () => {
    if (!previewData) return;

    setIsUploading(true);
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', form.getValues('file'));
      formData.append('type', importType);
      formData.append('confirm', 'true');

      // Send the file to the server for import
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error importing file');
      }

      // Show success message
      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.imported} records`,
      });
      setUploadStatus('success');

      // Reset the form
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreviewData(null);

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import file",
        variant: "destructive"
      });
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle template download
  const handleDownloadTemplate = () => {
    // Different template URLs based on import type
    const templateUrls = {
      rides: '/templates/rides-template.csv',
      expenses: '/templates/expenses-template.csv',
      vehicles: '/templates/vehicles-template.csv'
    };

    // Open the template URL
    window.open(templateUrls[importType], '_blank');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rides" onValueChange={(value) => setImportType(value as ImportType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rides">Rides</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>
        
        {/* Rides Tab Content */}
        <TabsContent value="rides">
          <Card>
            <CardHeader>
              <CardTitle>Import Rides</CardTitle>
              <CardDescription>
                Import your ride data in bulk from a CSV, Excel, or JSON file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    Download our template file to ensure your data is formatted correctly.
                    The template includes all required fields and column formats.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                  className="w-full md:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Expenses Tab Content */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Import Expenses</CardTitle>
              <CardDescription>
                Import your expense data in bulk from a CSV, Excel, or JSON file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    Download our template file to ensure your data is formatted correctly.
                    The template includes all required fields and column formats.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                  className="w-full md:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Vehicles Tab Content */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Import Vehicles</CardTitle>
              <CardDescription>
                Import your vehicle data in bulk from a CSV, Excel, or JSON file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    Download our template file to ensure your data is formatted correctly.
                    The template includes all required fields and column formats.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                  className="w-full md:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Data</CardTitle>
          <CardDescription>
            Select the file containing your {importType} data to import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ref, ...rest } }) => (
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.json"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        disabled={isUploading}
                        {...rest}
                      />
                    </FormControl>
                    <FormDescription>
                      Select a CSV, Excel (XLSX), or JSON file containing your {importType} data
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isUploading}
                className="w-full md:w-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Validate File
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Preview and Confirmation Section */}
      {uploadStatus === 'preview' && previewData && (
        <Card>
          <CardHeader>
            <CardTitle>
              Data Preview
              {previewData.invalidRows > 0 ? (
                <Badge variant="destructive" className="ml-2">
                  {previewData.invalidRows} issues
                </Badge>
              ) : (
                <Badge variant="default" className="ml-2 bg-green-500">
                  Valid
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Review your data before importing it to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Total Records: </span>
                    <span className="text-sm">{previewData.rows.length}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Valid Records: </span>
                    <span className="text-sm text-green-500">{previewData.validRows}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Invalid Records: </span>
                    <span className="text-sm text-red-500">{previewData.invalidRows}</span>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewData.headers.map((header, index) => (
                        <TableHead key={index}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.rows.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {previewData.headers.map((header, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {row[header] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Error Display */}
              {previewData.errors.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="errors">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                        <span>{previewData.errors.length} Errors Found</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {previewData.errors.map((error, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Row {error.row + 1}</AlertTitle>
                            <AlertDescription>
                              {error.column}: {error.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <Button 
                  onClick={handleConfirmImport} 
                  disabled={isUploading || previewData.validRows === 0}
                  className="w-full md:w-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Import {previewData.validRows} Records
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUploadStatus('idle');
                    setPreviewData(null);
                  }}
                  disabled={isUploading}
                  className="w-full md:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {uploadStatus === 'success' && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Import Successful</AlertTitle>
          <AlertDescription>
            Your data has been successfully imported and is now available in your account.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {uploadStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import Failed</AlertTitle>
          <AlertDescription>
            There was an error importing your data. Please try again or contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 
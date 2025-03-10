"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, AlertCircle, CheckCircle2, Info, Loader2, Car, Receipt } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { getVehiclesByUserIdAction } from "@/actions/vehicles-actions";
import { SelectVehicle } from "@/db/schema/vehicles-schema";

// Define the schema for the import form
const importFormSchema = z.object({
  type: z.enum(["rides", "expenses"]),
  vehicleId: z.string().min(1, "Please select a vehicle"),
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
type ImportType = "rides" | "expenses";

// Define the state for the preview data
type PreviewData = {
  headers: string[];
  rows: Record<string, string>[];
  validRows: number;
  invalidRows: number;
  errors: { row: number; column: string; message: string }[];
};

// Define CSV templates by type
const csvTemplates = {
  rides: `rideType,sessionDate,timeOnline,timeBooked,distanceOnline,distanceBooked,totalAmount,notes
uber,2023-08-15,5.5,4.2,120,95,180.50,Morning rush hour rides
lyft,2023-08-16,6.0,5.0,135,110,195.75,Airport trips included
other,2023-08-17,4.75,3.8,90,75,150.25,Evening short trips
`,
  expenses: `expenseType,date,amount,description
fuel,2023-08-15,45.75,Regular unleaded gas
maintenance,2023-08-10,120.00,Oil change and tire rotation
insurance,2023-08-01,185.50,Monthly insurance payment
parking,2023-08-12,15.00,Airport parking fee
`
};

export function DataImportForm() {
  const [activeImportType, setActiveImportType] = useState<ImportType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'preview'>('idle');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [vehicles, setVehicles] = useState<SelectVehicle[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      const result = await getVehiclesByUserIdAction();
      if (result.status === "success" && result.data) {
        setVehicles(result.data);
      } else {
        toast({
          title: "Error fetching vehicles",
          description: "Please make sure you have added at least one vehicle",
          variant: "destructive"
        });
      }
    };
    fetchVehicles();
  }, [toast]);

  // Initialize form
  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      type: "rides",
      vehicleId: ""
    }
  });

  // Set the type when a card is selected
  const selectImportType = (type: ImportType) => {
    setActiveImportType(type);
    form.setValue("type", type);
    if (uploadStatus === 'preview') {
      setUploadStatus('idle');
      setPreviewData(null);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("file", file);
      // Trigger validation after setting the value
      form.trigger("file");
    }
  };

  // Handle download template for a specific type
  const handleDownloadTemplate = (type: ImportType) => {
    const csvContent = csvTemplates[type];
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle form submission
  const onSubmit = async (values: ImportFormValues) => {
    if (!activeImportType) {
      toast({
        title: "Error",
        description: "Please select an import type (Rides or Expenses)",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', values.file);
      formData.append('type', activeImportType);
      formData.append('vehicleId', values.vehicleId);

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
    if (!previewData || !activeImportType) return;

    setIsUploading(true);
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      const file = form.getValues('file');
      if (!file) {
        throw new Error('File is missing');
      }
      
      formData.append('file', file);
      formData.append('type', activeImportType);
      formData.append('vehicleId', form.getValues('vehicleId'));
      formData.append('confirm', 'true');

      // Send the file to the server for import
      const response = await fetch('/api/import/process', {
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
      form.reset({ type: activeImportType, vehicleId: "" });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreviewData(null);
      setActiveImportType(null);

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

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight">Import Data</h2>
      <p className="text-muted-foreground">
        Import your data in bulk from a CSV, Excel, or JSON file
      </p>

      {/* Import Type Selection */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Rides Import Card */}
        <Card className={`cursor-pointer border-2 hover:border-primary/50 ${activeImportType === 'rides' ? 'border-primary' : 'border-border'}`}
            onClick={() => selectImportType('rides')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2" /> 
              Import Rides
            </CardTitle>
            <CardDescription>
              Import your driving sessions data in bulk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Import ride data including session date, time, distance, and earnings
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadTemplate('rides');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </CardFooter>
        </Card>

        {/* Expenses Import Card */}
        <Card className={`cursor-pointer border-2 hover:border-primary/50 ${activeImportType === 'expenses' ? 'border-primary' : 'border-border'}`}
            onClick={() => selectImportType('expenses')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Import Expenses
            </CardTitle>
            <CardDescription>
              Import your vehicle expense data in bulk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Import expense data including type, date, amount, and description
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadTemplate('expenses');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* File Upload Form - Only shown when an import type is selected */}
      {activeImportType && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  Upload {activeImportType === 'rides' ? 'Rides' : 'Expenses'} Data
                  <Badge className="ml-2">{activeImportType}</Badge>
                </CardTitle>
                <CardDescription>
                  Select your vehicle and upload a file to import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.nickname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select which vehicle this data belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        Select a CSV, Excel (XLSX), or JSON file
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={isUploading}
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
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}

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

      {activeImportType && (
        <div className="border rounded-md p-4 mb-6 bg-muted/50">
          <h3 className="text-lg font-medium mb-2">Data Format Example</h3>
          <p className="text-sm mb-4">Your CSV or JSON data should follow this format:</p>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {activeImportType === "rides" ? (
                    <>
                      <TableHead>rideType</TableHead>
                      <TableHead>sessionDate</TableHead>
                      <TableHead>timeOnline</TableHead>
                      <TableHead>timeBooked</TableHead>
                      <TableHead>distanceOnline</TableHead>
                      <TableHead>distanceBooked</TableHead>
                      <TableHead>totalAmount</TableHead>
                      <TableHead>notes</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>expenseType</TableHead>
                      <TableHead>date</TableHead>
                      <TableHead>amount</TableHead>
                      <TableHead>description</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeImportType === "rides" ? (
                  <>
                    <TableRow>
                      <TableCell>uber</TableCell>
                      <TableCell>2023-08-15</TableCell>
                      <TableCell>5.5</TableCell>
                      <TableCell>4.2</TableCell>
                      <TableCell>120</TableCell>
                      <TableCell>95</TableCell>
                      <TableCell>180.50</TableCell>
                      <TableCell>Morning rush hour</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>lyft</TableCell>
                      <TableCell>2023-08-16</TableCell>
                      <TableCell>6.0</TableCell>
                      <TableCell>5.0</TableCell>
                      <TableCell>135</TableCell>
                      <TableCell>110</TableCell>
                      <TableCell>195.75</TableCell>
                      <TableCell>Airport trips</TableCell>
                    </TableRow>
                  </>
                ) : (
                  <>
                    <TableRow>
                      <TableCell>fuel</TableCell>
                      <TableCell>2023-08-15</TableCell>
                      <TableCell>45.75</TableCell>
                      <TableCell>Regular unleaded gas</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>maintenance</TableCell>
                      <TableCell>2023-08-10</TableCell>
                      <TableCell>120.00</TableCell>
                      <TableCell>Oil change and tire rotation</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <p className="text-sm mb-2">
              <strong>Notes:</strong>
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {activeImportType === "rides" ? (
                <>
                  <li><strong>rideType</strong>: Must be one of: "uber", "lyft", "other"</li>
                  <li><strong>sessionDate</strong>: Date format (YYYY-MM-DD)</li>
                  <li><strong>timeOnline/timeBooked</strong>: Hours as decimal numbers</li>
                  <li><strong>distanceOnline/distanceBooked</strong>: Miles as numbers</li>
                  <li><strong>totalAmount</strong>: Dollar amount (e.g., 180.50)</li>
                  <li><strong>notes</strong>: Optional text field</li>
                </>
              ) : (
                <>
                  <li><strong>expenseType</strong>: Must be one of: "fuel", "maintenance", "insurance", "car_payment", "cleaning", "parking", "tolls", "other"</li>
                  <li><strong>date</strong>: Date format (YYYY-MM-DD)</li>
                  <li><strong>amount</strong>: Dollar amount (e.g., 45.75)</li>
                  <li><strong>description</strong>: Optional text field</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 
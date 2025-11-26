import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";

interface RoomCSVRow {
  name: string;
  building?: string;
  floor?: string;
  capacity?: string;
}

export function BulkRoomImport() {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = [
      ["name", "building", "floor", "capacity"],
      ["Room 101", "Main Building", "1", "30"],
      ["Room 102", "Main Building", "1", "35"],
      ["Lab A", "Science Block", "2", "25"],
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rooms_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Fill in the template and upload it to import rooms",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    Papa.parse<RoomCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rooms = results.data
            .filter((row) => row.name && row.name.trim() !== "")
            .map((row) => ({
              name: row.name.trim(),
              building: row.building?.trim() || null,
              floor: row.floor ? parseInt(row.floor) : null,
              capacity: row.capacity ? parseInt(row.capacity) : null,
            }));

          if (rooms.length === 0) {
            toast({
              title: "Error",
              description: "No valid rooms found in CSV file",
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }

          // Validate data
          const errors: string[] = [];
          rooms.forEach((room, index) => {
            if (room.name.length > 50) {
              errors.push(`Row ${index + 2}: Room name too long (max 50 characters)`);
            }
            if (room.building && room.building.length > 50) {
              errors.push(`Row ${index + 2}: Building name too long (max 50 characters)`);
            }
            if (room.floor !== null && (room.floor < -10 || room.floor > 100)) {
              errors.push(`Row ${index + 2}: Floor must be between -10 and 100`);
            }
            if (room.capacity !== null && (room.capacity < 1 || room.capacity > 1000)) {
              errors.push(`Row ${index + 2}: Capacity must be between 1 and 1000`);
            }
          });

          if (errors.length > 0) {
            toast({
              title: "Validation Errors",
              description: errors.slice(0, 3).join("; ") + (errors.length > 3 ? "..." : ""),
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }

          const { data, error } = await supabase.from("rooms").insert(rooms).select();

          if (error) {
            console.error("Error importing rooms:", error);
            toast({
              title: "Import Failed",
              description: error.message.includes("duplicate")
                ? "Some rooms already exist with the same name"
                : "Failed to import rooms. Please check your permissions.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Success",
              description: `Successfully imported ${data.length} room(s)`,
            });
          }
        } catch (error) {
          console.error("Error processing CSV:", error);
          toast({
            title: "Error",
            description: "Failed to process CSV file",
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        toast({
          title: "Error",
          description: "Failed to parse CSV file",
          variant: "destructive",
        });
        setIsImporting(false);
      },
    });
  };

  return (
    <Card>
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Room Import
        </CardTitle>
        <CardDescription>Import multiple rooms from a CSV file</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={downloadTemplate} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button
              variant="blue"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? "Importing..." : "Upload CSV"}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">CSV Format Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <strong>name</strong> (required): Room name (max 50 characters)
              </li>
              <li>
                <strong>building</strong> (optional): Building name (max 50 characters)
              </li>
              <li>
                <strong>floor</strong> (optional): Floor number (-10 to 100)
              </li>
              <li>
                <strong>capacity</strong> (optional): Room capacity (1 to 1000)
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

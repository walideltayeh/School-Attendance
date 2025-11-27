import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Bus, User, Phone, Clock, MapPin } from "lucide-react";
import { CameraQRScanner } from "@/components/attendance/CameraQRScanner";
import { AttendanceScanner } from "@/components/attendance/AttendanceScanner";
import QRCode from "react-qr-code";

interface BusRoute {
  id: string;
  name: string;
  route_code: string;
  driver_name: string;
  driver_phone: string;
  departure_time: string;
  qr_code: string;
}

interface ScanRecord {
  id: string;
  name: string;
  success: boolean;
  time: Date;
  message: string;
}

export default function BusAttendance() {
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [selectedBus, setSelectedBus] = useState<BusRoute | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBusRoutes();
  }, []);

  useEffect(() => {
    if (selectedBusId) {
      const bus = busRoutes.find(b => b.id === selectedBusId);
      setSelectedBus(bus || null);
    }
  }, [selectedBusId, busRoutes]);

  const loadBusRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from("bus_routes")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setBusRoutes(data || []);
    } catch (error) {
      console.error("Error loading bus routes:", error);
      toast({
        title: "Error",
        description: "Failed to load bus routes",
        variant: "destructive",
      });
    }
  };

  const handleScan = async (qrCode: string) => {
    if (!selectedBus) {
      toast({
        title: "No Bus Selected",
        description: "Please select a bus route first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Validate it's a student QR code
      if (!qrCode.startsWith("STUDENT:")) {
        toast({
          title: "Invalid QR Code",
          description: "Please scan a valid student QR code",
          variant: "destructive",
        });
        
        setRecentScans(prev => [{
          id: qrCode,
          name: "Invalid QR",
          success: false,
          time: new Date(),
          message: "Not a student QR code",
        }, ...prev.slice(0, 9)]);
        return;
      }

      // Get student info
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, full_name, student_code")
        .eq("qr_code", qrCode)
        .eq("status", "active")
        .maybeSingle();

      if (studentError) throw studentError;

      if (!studentData) {
        toast({
          title: "Student Not Found",
          description: "Invalid student QR code",
          variant: "destructive",
        });
        
        setRecentScans(prev => [{
          id: qrCode,
          name: "Unknown Student",
          success: false,
          time: new Date(),
          message: "Student not found",
        }, ...prev.slice(0, 9)]);
        return;
      }

      // Check if student is assigned to this bus
      const { data: assignmentData } = await supabase
        .from("bus_assignments")
        .select("*")
        .eq("student_id", studentData.id)
        .eq("route_id", selectedBus.id)
        .eq("status", "active")
        .maybeSingle();

      if (!assignmentData) {
        toast({
          title: "Not Assigned",
          description: `${studentData.full_name} is not assigned to this bus`,
          variant: "destructive",
        });
        
        setRecentScans(prev => [{
          id: studentData.id,
          name: studentData.full_name,
          success: false,
          time: new Date(),
          message: "Not assigned to this bus",
        }, ...prev.slice(0, 9)]);
        return;
      }

      // Record bus attendance (class_id not needed for bus type)
      // We need to get the user's ID for recorded_by
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: insertError } = await supabase
        .from("attendance_records")
        .insert([{
          student_id: studentData.id,
          class_id: '00000000-0000-0000-0000-000000000000', // Dummy class ID for bus attendance
          bus_route_id: selectedBus.id,
          recorded_by: user?.id || '00000000-0000-0000-0000-000000000000',
          status: "present",
          type: "bus",
          date: new Date().toISOString().split('T')[0],
          scanned_at: new Date().toISOString(),
        }]);

      if (insertError) throw insertError;

      toast({
        title: "Attendance Recorded",
        description: `${studentData.full_name} boarded successfully`,
      });

      setRecentScans(prev => [{
        id: studentData.id,
        name: studentData.full_name,
        success: true,
        time: new Date(),
        message: "Boarded",
      }, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error("Error recording bus attendance:", error);
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Bus Attendance</h1>
          <p className="text-muted-foreground">Scan student QR codes when boarding the bus</p>
        </div>

        {/* Bus Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5" />
              Select Bus Route
            </CardTitle>
            <CardDescription>Choose the bus route for attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedBusId} onValueChange={setSelectedBusId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bus route..." />
              </SelectTrigger>
              <SelectContent>
                {busRoutes.map((bus) => (
                  <SelectItem key={bus.id} value={bus.id}>
                    {bus.name} - {bus.route_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Selected Bus Details */}
        {selectedBus && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Bus Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedBus.name}</span>
                  <Badge variant="outline">{selectedBus.route_code}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Driver: {selectedBus.driver_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedBus.driver_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Departure: {selectedBus.departure_time}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Bus QR Code (for students to scan):</p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCode value={selectedBus.qr_code} size={150} level="H" />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Students can scan this code from their portal
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scanner */}
        {selectedBus && (
          <div className="space-y-4">
            {!isScanning ? (
              <Button
                onClick={() => setIsScanning(true)}
                size="lg"
                className="w-full"
              >
                Start Scanning Student QR Codes
              </Button>
            ) : (
              <>
                <CameraQRScanner
                  onScan={handleScan}
                  isActive={isScanning}
                  onClose={() => setIsScanning(false)}
                />
              </>
            )}
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <AttendanceScanner
            type="bus"
            selectedItemName={selectedBus?.name || ""}
            isScanning={isScanning}
            onStartScan={() => setIsScanning(true)}
            onStopScan={() => setIsScanning(false)}
            recentScans={recentScans}
          />
        )}
      </div>
    </div>
  );
}

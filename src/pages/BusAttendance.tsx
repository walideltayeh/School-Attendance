import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [manualInput, setManualInput] = useState("");
  const [showCamera, setShowCamera] = useState(false);

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
    console.log('handleScan called with:', qrCode);
    
    if (!selectedBus) {
      console.log('No bus selected');
      toast({
        title: "No Bus Selected",
        description: "Please select a bus route first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Starting scan process for bus:', selectedBus.name);

      // Validate it's a student QR code
      if (!qrCode.startsWith("STUDENT:")) {
        console.log('Invalid QR format:', qrCode);
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

      console.log('Looking up student with QR code:', qrCode);
      
      // Get student info
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, full_name, student_code")
        .eq("qr_code", qrCode)
        .eq("status", "active")
        .maybeSingle();

      if (studentError) {
        console.error('Student lookup error:', studentError);
        throw studentError;
      }

      if (!studentData) {
        console.log('Student not found for QR:', qrCode);
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

      console.log('Student found:', studentData.full_name);

      // Check if student is assigned to this bus
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("bus_assignments")
        .select("*")
        .eq("student_id", studentData.id)
        .eq("route_id", selectedBus.id)
        .eq("status", "active")
        .maybeSingle();

      if (assignmentError) {
        console.error('Assignment check error:', assignmentError);
      }

      if (!assignmentData) {
        console.log('Student not assigned to this bus');
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

      console.log('Recording attendance for student:', studentData.full_name);

      // Record bus attendance
      const { error: insertError } = await supabase
        .from("attendance_records")
        .insert([{
          student_id: studentData.id,
          class_id: '00000000-0000-0000-0000-000000000000', // Dummy class ID for bus attendance
          bus_route_id: selectedBus.id,
          recorded_by: null,
          status: "present",
          type: "bus",
          date: new Date().toISOString().split('T')[0],
          scanned_at: new Date().toISOString(),
        }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        
        // Check if it's a duplicate entry
        if (insertError.code === '23505') {
          toast({
            title: "Already Checked In",
            description: `${studentData.full_name} has already boarded today`,
            variant: "destructive",
          });
          
          setRecentScans(prev => [{
            id: studentData.id,
            name: studentData.full_name,
            success: false,
            time: new Date(),
            message: "Already checked in today",
          }, ...prev.slice(0, 9)]);
          return;
        }
        
        throw insertError;
      }

      console.log('Attendance recorded successfully');

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

    } catch (error: any) {
      console.error("Error recording bus attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle manual input for bus attendance
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Manual submit with input:', manualInput);
    
    if (!manualInput.trim()) {
      console.log('Empty input');
      return;
    }

    try {
      // Look up by student code
      const { data: studentData, error } = await supabase
        .from("students")
        .select("qr_code")
        .eq("student_code", manualInput.trim())
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        console.error('Error looking up student code:', error);
        throw error;
      }

      if (studentData?.qr_code) {
        console.log('Found student, calling handleScan with QR:', studentData.qr_code);
        await handleScan(studentData.qr_code);
      } else {
        console.log('Student code not found:', manualInput);
        toast({
          title: "Student Not Found",
          description: "Invalid student code",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Manual submit error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to look up student",
        variant: "destructive",
      });
    }
    
    setManualInput("");
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
          <Card>
            <CardHeader>
              <CardTitle>Scan Student Attendance</CardTitle>
              <CardDescription>Use manual entry or camera to record boarding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Manual Input Option */}
              <div className="space-y-2">
                <Label htmlFor="manual-student-code">Manual Student Code Entry</Label>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input
                    id="manual-student-code"
                    placeholder="Enter student code (e.g., STU8371)"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    disabled={loading}
                  />
                  <Button type="submit" disabled={loading || !manualInput.trim()}>
                    Submit
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  Use this if camera scanning is not available
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or scan with camera
                  </span>
                </div>
              </div>

              {/* Camera Scanner */}
              {showCamera ? (
                <CameraQRScanner
                  onScan={handleScan}
                  isActive={showCamera}
                  onClose={() => setShowCamera(false)}
                />
              ) : (
                <Button
                  onClick={() => setShowCamera(true)}
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  Start Camera Scanner
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <AttendanceScanner
            type="bus"
            selectedItemName={selectedBus?.name || ""}
            isScanning={showCamera}
            onStartScan={() => setShowCamera(true)}
            onStopScan={() => setShowCamera(false)}
            recentScans={recentScans}
          />
        )}
      </div>
    </div>
  );
}

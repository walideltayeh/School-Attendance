
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, QrCode, RefreshCw, Clock, Calendar, User, Users, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { dataService, ScanRecord, Room, Teacher } from "@/services/dataService";
import { AttendanceScanner } from "@/components/attendance/AttendanceScanner";
import { supabase } from "@/integrations/supabase/client";

export default function Attendance() {
  const { roomId, teacherId } = useParams();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("classroom");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [busRoutes, setBusRoutes] = useState<any[]>([]);

  // Load teacher and room data if IDs are provided
  useEffect(() => {
    fetchClasses();
    fetchBusRoutes();
    
    if (roomId) {
      const foundRoom = dataService.getRoom(roomId);
      if (foundRoom) {
        setRoom(foundRoom);
      }
    }
    
    if (teacherId) {
      const teacher = dataService.getTeachers().find(t => t.id === teacherId);
      if (teacher) {
        setTeacher(teacher);
      } else {
        // If teacher doesn't exist, redirect back to login
        toast({
          title: "Error",
          description: "Teacher not found",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [roomId, teacherId, navigate]);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error loading classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    } else {
      setClasses(data || []);
    }
  };

  const fetchBusRoutes = async () => {
    const { data, error } = await supabase
      .from('bus_routes')
      .select('*')
      .eq('status', 'active')
      .order('name');
    
    if (error) {
      console.error("Error loading bus routes:", error);
      toast({
        title: "Error",
        description: "Failed to load bus routes",
        variant: "destructive"
      });
    } else {
      setBusRoutes(data || []);
    }
  };

  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStartScan = () => {
    // Validate selection
    if (activeTab === "classroom" && !selectedClass) {
      toast({
        title: "Please select a class",
        description: "You must select a class before starting the scan.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "bus" && !selectedBus) {
      toast({
        title: "Please select a bus route",
        description: "You must select a bus route before starting the scan.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    toast({
      title: "Scanner Activated",
      description: "Ready to scan student IDs.",
    });

    // For demo purposes, let's simulate a scan after 2 seconds
    setTimeout(() => {
      simulateScan();
    }, 2000);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    toast({
      title: "Scanner Deactivated",
      description: "Scanning has been stopped.",
    });
  };

  // Function to simulate a student scan for demo purposes
  const simulateScan = () => {
    // Get a random student from our database
    const students = dataService.getStudents();
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    
    // Randomly determine if the scan is successful (90% chance of success)
    const isSuccessful = Math.random() > 0.1;
    
    // Create a scan record
    const newScan: ScanRecord = {
      id: randomStudent.id,
      name: randomStudent.name,
      time: new Date(),
      success: isSuccessful,
      message: isSuccessful 
        ? `Successfully checked in to ${activeTab === "classroom" ? "class" : "bus"}`
        : `Error: ${Math.random() > 0.5 ? "Student not enrolled" : "Invalid ID"}`
    };
    
    // Add to recent scans
    setRecentScans(prevScans => [newScan, ...prevScans.slice(0, 9)]);
    
    // Show notification
    if (isSuccessful) {
      toast({
        title: "Attendance Recorded",
        description: `${randomStudent.name} (${randomStudent.id}) checked in successfully.`,
      });
    } else {
      toast({
        title: "Scan Error",
        description: newScan.message,
        variant: "destructive",
      });
    }
    
    // If still scanning, schedule another scan
    if (isScanning) {
      setTimeout(() => {
        simulateScan();
      }, Math.random() * 5000 + 2000); // Random time between 2-7 seconds
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Handle logout (for classroom device mode)
  const handleLogout = () => {
    navigate("/");
  };

  // Get the selected item name for display
  const getSelectedItemName = () => {
    if (activeTab === "classroom") {
      const classItem = classes.find(c => c.id === selectedClass);
      return classItem ? classItem.name : "";
    } else {
      const busRoute = busRoutes.find(b => b.id === selectedBus);
      return busRoute ? busRoute.name : "";
    }
  };

  // If in classroom device mode with teacher login
  if (roomId && teacherId && teacher) {
    // Get today's schedule for this room
    const todaySchedules = dataService.getRoomScheduleForToday(roomId);
    
    // Get teacher's classes - now filtering by teacher_id from Supabase
    const teacherClasses = classes.filter(c => c.teacher_id === teacherId);
    
    return (
      <div className="space-y-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Classroom Attendance</h2>
            <p className="text-muted-foreground">
              {room?.name} - Logged in as {teacher.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
              <Clock className="h-5 w-5 text-school-primary" />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
            <Button variant="blue-outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>
                  {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaySchedules.length > 0 ? (
                  todaySchedules.map((schedule, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-md p-3 ${schedule.teacherId === teacherId ? 'bg-primary/10 border-primary/30' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center">
                            {schedule.period}
                          </div>
                          <div>
                            <p className="font-medium">{schedule.className}</p>
                            <p className="text-xs text-muted-foreground">Teacher: {schedule.teacherName}</p>
                          </div>
                        </div>
                        {schedule.teacherId === teacherId && (
                          <Badge>Your Class</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No classes scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance Scanner</CardTitle>
                <CardDescription>
                  Select your class and scan student IDs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class-select">Select Your Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger id="class-select">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name} - {classItem.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedClass && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <h4 className="font-semibold">Class Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Subject:</p>
                        <p>{classes.find(c => c.id === selectedClass)?.subject}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Room Number:</p>
                        <p>{classes.find(c => c.id === selectedClass)?.room}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isScanning ? (
                  <Button 
                    className="w-full bg-school-primary hover:bg-school-secondary" 
                    onClick={handleStartScan}
                    disabled={!selectedClass}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleStopScan}
                  >
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Stop Scanning
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <AttendanceScanner
              type="classroom"
              selectedItemName={classes.find(c => c.id === selectedClass)?.name || ""}
              isScanning={isScanning}
              onStartScan={handleStartScan}
              onStopScan={handleStopScan}
              recentScans={recentScans}
            />
          </div>
        </div>
      </div>
    );
  }

  // Standard attendance page (original behavior)
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Scanner</h2>
          <p className="text-muted-foreground">
            Scan student barcodes for attendance tracking
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
          <Clock className="h-5 w-5 text-school-primary" />
          <span className="font-mono">{formatTime(currentTime)}</span>
        </div>
      </div>
      
      <Tabs defaultValue="classroom" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="classroom">Classroom Attendance</TabsTrigger>
          <TabsTrigger value="bus">Bus Attendance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="classroom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classroom Setup</CardTitle>
              <CardDescription>
                Configure the scanner for classroom attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class-select">Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedClass && (
                <div className="rounded-lg border p-4 space-y-2">
                  <h4 className="font-semibold">Class Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Subject:</p>
                      <p>{classes.find(c => c.id === selectedClass)?.subject}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Room Number:</p>
                      <p>{classes.find(c => c.id === selectedClass)?.room_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Grade:</p>
                      <p>{classes.find(c => c.id === selectedClass)?.grade}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Section:</p>
                      <p>{classes.find(c => c.id === selectedClass)?.section}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Classroom Device Mode
                </h4>
                <p className="text-sm text-muted-foreground">
                  Set up a dedicated device in each classroom for attendance tracking:
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => navigate("/classroom-login/RM001")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Open Classroom Device
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              {!isScanning ? (
                <Button 
                  className="bg-school-primary hover:bg-school-secondary mr-2" 
                  onClick={handleStartScan}
                  disabled={!selectedClass}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="mr-2" 
                  onClick={handleStopScan}
                >
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Stop Scanning
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="bus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bus Route Setup</CardTitle>
              <CardDescription>
                Configure the scanner for bus attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bus-select">Select Bus Route</Label>
                <Select value={selectedBus} onValueChange={setSelectedBus}>
                  <SelectTrigger id="bus-select">
                    <SelectValue placeholder="Select a bus route" />
                  </SelectTrigger>
                  <SelectContent>
                    {busRoutes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedBus && (
                <div className="rounded-lg border p-4 space-y-2">
                  <h4 className="font-semibold">Bus Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Driver:</p>
                      <p>{busRoutes.find(b => b.id === selectedBus)?.driver_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone:</p>
                      <p>{busRoutes.find(b => b.id === selectedBus)?.driver_phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Departure:</p>
                      <p>{busRoutes.find(b => b.id === selectedBus)?.departure_time}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!isScanning ? (
                <Button 
                  className="bg-school-primary hover:bg-school-secondary mr-2" 
                  onClick={handleStartScan}
                  disabled={!selectedBus}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="mr-2" 
                  onClick={handleStopScan}
                >
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Stop Scanning
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AttendanceScanner
        type={activeTab as "classroom" | "bus"}
        selectedItemName={getSelectedItemName()}
        isScanning={isScanning}
        onStartScan={handleStartScan}
        onStopScan={handleStopScan}
        recentScans={recentScans}
      />
    </div>
  );
}

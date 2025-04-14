import { useState, useEffect } from "react";
import { Check, QrCode, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { dataService, ClassInfo, BusRoute, ScanRecord } from "@/services/dataService";

export default function Attendance() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("classroom");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  
  const classes = dataService.getClasses();
  const busRoutes = dataService.getBusRoutes();

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
                      <p className="text-muted-foreground">Teacher:</p>
                      <p>{classes.find(c => c.id === selectedClass)?.teacher}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Room Number:</p>
                      <p>{classes.find(c => c.id === selectedClass)?.room}</p>
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
                      <p>{busRoutes.find(b => b.id === selectedBus)?.driver}</p>
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
      
      {isScanning && (
        <Card className="bg-muted/50 border-school-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-school-primary" />
              Scanner Active
            </CardTitle>
            <CardDescription>
              {activeTab === "classroom" 
                ? `Scanning for Class: ${classes.find(c => c.id === selectedClass)?.name}`
                : `Scanning for Bus Route: ${busRoutes.find(b => b.id === selectedBus)?.name}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Alert>
              <QrCode className="h-4 w-4" />
              <AlertTitle>Ready to scan</AlertTitle>
              <AlertDescription>
                Scan student ID cards or bracelets to record attendance.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
      
      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>
              History of recent attendance scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    scan.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {scan.success ? (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-school-success" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <QrCode className="h-4 w-4 text-school-danger" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{scan.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {scan.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={scan.success ? "default" : "outline"} className={scan.success ? "bg-school-success" : "text-school-danger"}>
                      {scan.success ? "Checked In" : "Failed"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(scan.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

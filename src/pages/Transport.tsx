
import { useState } from "react";
import { 
  Bus, 
  User, 
  MapPin, 
  Clock, 
  Search, 
  MoreHorizontal, 
  Plus,
  Route,
  Calendar,
  FileDown,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock bus route data
const busRoutes = [
  { 
    id: "BUS001", 
    name: "Route #1", 
    driver: "John Smith",
    phone: "(555) 123-4567",
    students: 28,
    stops: 8,
    departureTime: "7:30 AM",
    returnTime: "3:30 PM",
    status: "active"
  },
  { 
    id: "BUS002", 
    name: "Route #2", 
    driver: "Mary Johnson",
    phone: "(555) 234-5678",
    students: 25,
    stops: 7,
    departureTime: "7:45 AM",
    returnTime: "3:45 PM",
    status: "active"
  },
  { 
    id: "BUS003", 
    name: "Route #3", 
    driver: "Robert Lee",
    phone: "(555) 345-6789",
    students: 22,
    stops: 6,
    departureTime: "7:30 AM",
    returnTime: "3:30 PM",
    status: "active"
  },
  { 
    id: "BUS004", 
    name: "Route #4", 
    driver: "Patricia Clark",
    phone: "(555) 456-7890",
    students: 24,
    stops: 9,
    departureTime: "7:15 AM",
    returnTime: "3:15 PM",
    status: "inactive"
  },
  { 
    id: "BUS005", 
    name: "Route #5", 
    driver: "Michael Davis",
    phone: "(555) 567-8901",
    students: 30,
    stops: 10,
    departureTime: "7:00 AM",
    returnTime: "3:00 PM",
    status: "active"
  },
];

// Mock bus stops for Route #1
const busStops = [
  { id: "STOP1", name: "Oakwood Drive & 5th Ave", time: "7:10 AM", students: 5 },
  { id: "STOP2", name: "Pine Street Elementary", time: "7:15 AM", students: 8 },
  { id: "STOP3", name: "Maple Road & 10th St", time: "7:18 AM", students: 3 },
  { id: "STOP4", name: "Cedar Boulevard", time: "7:22 AM", students: 4 },
  { id: "STOP5", name: "Willow Lane & Park Ave", time: "7:25 AM", students: 6 },
  { id: "STOP6", name: "Elmwood Community Center", time: "7:28 AM", students: 2 },
];

// Mock student assignments for Route #1
const busStudents = [
  { id: "ST001", name: "Emma Thompson", grade: "Grade 5", stop: "Oakwood Drive & 5th Ave" },
  { id: "ST002", name: "Noah Martinez", grade: "Grade 5", stop: "Pine Street Elementary" },
  { id: "ST006", name: "William Brown", grade: "Grade 7", stop: "Cedar Boulevard" },
  { id: "ST008", name: "James Johnson", grade: "Grade 8", stop: "Willow Lane & Park Ave" },
  { id: "ST012", name: "Sophia Wilson", grade: "Grade 6", stop: "Maple Road & 10th St" },
  { id: "ST015", name: "Ethan Davis", grade: "Grade 5", stop: "Pine Street Elementary" },
  { id: "ST018", name: "Isabella Garcia", grade: "Grade 7", stop: "Elmwood Community Center" },
  { id: "ST022", name: "Lucas Smith", grade: "Grade 8", stop: "Willow Lane & Park Ave" },
];

export default function Transport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  
  const filteredRoutes = busRoutes.filter(route => 
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId === selectedRoute ? null : routeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transport</h2>
          <p className="text-muted-foreground">
            Manage bus routes and student transportation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-school-primary hover:bg-school-secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Route
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Bus Routes</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search routes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>
              View and manage school bus routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Details</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id} className={selectedRoute === route.id ? "bg-muted" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-school-light flex items-center justify-center">
                          <Bus className="h-5 w-5 text-school-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{route.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {route.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p>{route.driver}</p>
                      <p className="text-xs text-muted-foreground">{route.phone}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-green-600" />
                          <span>Departs: {route.departureTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-orange-600" />
                          <span>Returns: {route.returnTime}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{route.students} students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{route.stops} stops</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={route.status === "active" ? "default" : "secondary"} className={route.status === "active" ? "bg-school-success" : "bg-muted"}>
                        {route.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleRouteSelect(route.id)}>
                            <Route className="mr-2 h-4 w-4" />
                            {selectedRoute === route.id ? "Hide Details" : "View Details"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Students
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Bus className="mr-2 h-4 w-4" />
                            Bus Check-in
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredRoutes.length} of {busRoutes.length} routes
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {selectedRoute && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Route Information</CardTitle>
                <CardDescription>
                  Bus stops for {busRoutes.find(r => r.id === selectedRoute)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="stops">
                  <TabsList className="mb-4">
                    <TabsTrigger value="stops">Bus Stops</TabsTrigger>
                    <TabsTrigger value="students">Assigned Students</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="stops" className="space-y-4">
                    {busStops.map((stop) => (
                      <div key={stop.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">{stop.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{stop.time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{stop.students}</span>
                        </Badge>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="students">
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Bus Stop</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {busStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-school-accent text-school-dark">
                                      {student.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{student.name}</p>
                                    <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{student.grade}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-amber-600" />
                                  <span>{student.stop}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Tools for route management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-school-primary hover:bg-school-secondary justify-start">
                  <Bus className="mr-2 h-4 w-4" />
                  Start Bus Check-in
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign New Student
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bus Stop
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Modify Schedule
                </Button>
                
                <div className="rounded-lg border p-4 mt-6">
                  <h4 className="font-semibold mb-3">Today's Schedule</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-muted-foreground">Morning Departure:</span>
                      <span className="col-span-2 font-mono">{busRoutes.find(r => r.id === selectedRoute)?.departureTime}</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-muted-foreground">Arrival at School:</span>
                      <span className="col-span-2 font-mono">8:10 AM</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-muted-foreground">Afternoon Departure:</span>
                      <span className="col-span-2 font-mono">3:00 PM</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium text-muted-foreground">Return Completion:</span>
                      <span className="col-span-2 font-mono">{busRoutes.find(r => r.id === selectedRoute)?.returnTime}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { dataService, BusRoute, busStops, busStudents } from "@/services/dataService";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export default function Transport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(dataService.getBusRoutes());
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const filteredRoutes = busRoutes.filter(route => 
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId === selectedRoute ? null : routeId);
  };
  
  const handleExport = () => {
    // Create CSV content for bus routes
    const headers = ["ID", "Name", "Driver", "Phone", "Departure", "Return", "Students", "Stops", "Status"];
    const csvContent = [
      headers.join(','),
      ...filteredRoutes.map(route => [
        route.id,
        route.name,
        route.driver,
        route.phone,
        route.departureTime,
        route.returnTime,
        route.students,
        route.stops,
        route.status
      ].join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bus_routes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Bus routes data has been exported as CSV",
    });
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
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Go to Admin
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Card>
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
            View and manage school bus routes. To add new routes, please go to the Admin page.
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
  );
}

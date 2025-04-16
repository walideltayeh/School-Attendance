
import { useState, useEffect } from "react";
import { 
  Check, 
  Edit, 
  Eye, 
  FileDown, 
  FilePlus, 
  MoreHorizontal, 
  Search, 
  Trash2, 
  User, 
  QrCode,
  Mail,
  Bus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { dataService, Student, BusRoute } from "@/services/dataService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Students() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isIDCardDialogOpen, setIsIDCardDialogOpen] = useState(false);
  
  // Fetch students when component mounts
  useEffect(() => {
    setStudents(dataService.getStudents());
    setBusRoutes(dataService.getBusRoutes());
  }, []);
  
  const filteredStudents = searchQuery 
    ? dataService.searchStudents(searchQuery)
    : students;

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    // Navigate to register student page with pre-filled data
    navigate("/students/register", { state: { editStudent: student } });
    toast({
      title: "Edit Student",
      description: `Editing ${student.name}'s details`,
    });
  };

  const handleGenerateIDCard = (student: Student) => {
    setSelectedStudent(student);
    setIsIDCardDialogOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleSendMessage = (student: Student) => {
    setSelectedStudent(student);
    setIsMessageDialogOpen(true);
  };

  const handleSubmitMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Message Sent",
      description: `Message sent to ${selectedStudent?.name}'s parents`,
    });
    setMessageText("");
    setIsMessageDialogOpen(false);
  };

  const confirmDeleteStudent = () => {
    if (selectedStudent) {
      // In a real application, you would delete the student from the database
      const updatedStudents = students.filter(s => s.id !== selectedStudent.id);
      setStudents(updatedStudents);
      toast({
        title: "Student Deleted",
        description: `${selectedStudent.name} has been deleted from the system`,
      });
      setIsDeleteDialogOpen(false);
    }
  };

  const getBusRouteName = (routeId?: string) => {
    if (!routeId) return "None";
    const route = busRoutes.find(r => r.id === routeId);
    return route ? route.name : "Unknown";
  };

  const handleExport = () => {
    // Create CSV content for students
    const headers = ["ID", "Name", "Grade", "Section", "Teacher", "Blood Type", "Allergies", "Bus Route", "Status"];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.id,
        student.name,
        student.grade,
        student.section,
        student.teacher,
        student.bloodType,
        student.allergies ? "Yes" : "No",
        student.busRoute ? getBusRouteName(student.busRoute) : "None",
        student.status
      ].join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'students.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Student data has been exported as CSV",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage student information and registrations
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
            <CardTitle>Student Directory</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            View and manage all registered students. Register new students in Admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Grade/Section</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead>Bus Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.grade} - {student.section}</TableCell>
                  <TableCell>{student.teacher}</TableCell>
                  <TableCell>{student.bloodType}</TableCell>
                  <TableCell>{student.allergies ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {student.busRoute ? (
                      <div className="flex items-center gap-1">
                        <Bus className="h-4 w-4 text-school-primary" />
                        <span>{getBusRouteName(student.busRoute)}</span>
                      </div>
                    ) : (
                      "None"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === "active" ? "default" : "secondary"} className={student.status === "active" ? "bg-school-success" : "bg-muted"}>
                      {student.status === "active" ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Student
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGenerateIDCard(student)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          Barcode/ID Card
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendMessage(student)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteStudent(student)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Student
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
            Showing {filteredStudents.length} of {students.length} students
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

      {/* View Student Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected student.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedStudent.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Class</h4>
                  <p>{selectedStudent.grade} - Section {selectedStudent.section}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Teacher</h4>
                  <p>{selectedStudent.teacher}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Blood Type</h4>
                  <p>{selectedStudent.bloodType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Allergies</h4>
                  <p>{selectedStudent.allergies ? "Yes" : "No"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Bus Route</h4>
                  <p>{selectedStudent.busRoute ? getBusRouteName(selectedStudent.busRoute) : "None"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge variant={selectedStudent.status === "active" ? "default" : "secondary"} className={selectedStudent.status === "active" ? "bg-school-success" : "bg-muted"}>
                    {selectedStudent.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteStudent}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to {selectedStudent?.name}'s parents
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitMessage}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ID Card Dialog */}
      <Dialog open={isIDCardDialogOpen} onOpenChange={setIsIDCardDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Student ID Card</DialogTitle>
            <DialogDescription>
              Student ID Card and Barcode
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="p-4 border rounded-md">
              <div className="flex justify-center mb-4">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {selectedStudent.id}</p>
                <p className="text-sm">{selectedStudent.grade} - Section {selectedStudent.section}</p>
                {selectedStudent.busRoute && (
                  <div className="flex items-center justify-center mt-1 gap-1">
                    <Bus className="h-4 w-4 text-school-primary" />
                    <span className="text-sm">Route: {getBusRouteName(selectedStudent.busRoute)}</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-100 p-4 rounded-md flex justify-center items-center">
                <QrCode className="h-24 w-24" />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsIDCardDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast({
                title: "ID Card Printed",
                description: `ID Card for ${selectedStudent?.name} has been sent to the printer`,
              });
              setIsIDCardDialogOpen(false);
            }}>
              Print ID Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

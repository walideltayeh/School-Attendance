
import { useState } from "react";
import { 
  Check, 
  Edit, 
  Eye, 
  FileDown, 
  FilePlus, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2, 
  User, 
  QrCode 
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
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Mock student data
const students = [
  { 
    id: "ST001", 
    name: "Emma Thompson", 
    grade: "Grade 5", 
    section: "A", 
    teacher: "Ms. Johnson",
    bloodType: "A+",
    allergies: true,
    status: "active"
  },
  { 
    id: "ST002", 
    name: "Noah Martinez", 
    grade: "Grade 5", 
    section: "B", 
    teacher: "Mr. Davis",
    bloodType: "O-",
    allergies: false,
    status: "active"
  },
  { 
    id: "ST003", 
    name: "Olivia Wilson", 
    grade: "Grade 6", 
    section: "A", 
    teacher: "Ms. Adams",
    bloodType: "B+",
    allergies: true,
    status: "active"
  },
  { 
    id: "ST004", 
    name: "Liam Anderson", 
    grade: "Grade 6", 
    section: "B", 
    teacher: "Mr. Taylor",
    bloodType: "AB-",
    allergies: false,
    status: "inactive"
  },
  { 
    id: "ST005", 
    name: "Ava Garcia", 
    grade: "Grade 7", 
    section: "A", 
    teacher: "Ms. Williams",
    bloodType: "O+",
    allergies: true,
    status: "active"
  },
  { 
    id: "ST006", 
    name: "William Brown", 
    grade: "Grade 7", 
    section: "B", 
    teacher: "Mr. Jones",
    bloodType: "A-",
    allergies: false,
    status: "active"
  },
  { 
    id: "ST007", 
    name: "Sophia Miller", 
    grade: "Grade 8", 
    section: "A", 
    teacher: "Ms. Lewis",
    bloodType: "B-",
    allergies: true,
    status: "active"
  },
  { 
    id: "ST008", 
    name: "James Johnson", 
    grade: "Grade 8", 
    section: "B", 
    teacher: "Mr. Clark",
    bloodType: "AB+",
    allergies: false,
    status: "inactive"
  },
];

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Link to="/students/register">
            <Button className="bg-school-primary hover:bg-school-secondary">
              <Plus className="mr-2 h-4 w-4" />
              Register Student
            </Button>
          </Link>
          <Button variant="outline">
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
            View and manage all registered students
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Student
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <QrCode className="mr-2 h-4 w-4" />
                          Barcode/ID Card
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}

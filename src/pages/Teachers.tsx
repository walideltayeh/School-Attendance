
import { 
  Pencil, 
  Mail, 
  Phone, 
  User, 
  Search, 
  Plus,
  MoreHorizontal,
  FileDown 
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

// Mock teacher data
const teachers = [
  { 
    id: "T001", 
    name: "Ms. Johnson", 
    email: "johnson@school.edu", 
    phone: "(555) 123-4567", 
    subjects: ["Mathematics", "Science"],
    classes: ["Grade 5 - Section A"],
    students: 24
  },
  { 
    id: "T002", 
    name: "Mr. Davis", 
    email: "davis@school.edu", 
    phone: "(555) 234-5678", 
    subjects: ["English", "Social Studies"],
    classes: ["Grade 5 - Section B"],
    students: 22
  },
  { 
    id: "T003", 
    name: "Ms. Adams", 
    email: "adams@school.edu", 
    phone: "(555) 345-6789", 
    subjects: ["Mathematics", "Science"],
    classes: ["Grade 6 - Section A"],
    students: 26
  },
  { 
    id: "T004", 
    name: "Mr. Taylor", 
    email: "taylor@school.edu", 
    phone: "(555) 456-7890", 
    subjects: ["English", "Arts"],
    classes: ["Grade 6 - Section B"],
    students: 23
  },
  { 
    id: "T005", 
    name: "Ms. Williams", 
    email: "williams@school.edu", 
    phone: "(555) 567-8901", 
    subjects: ["Mathematics", "Computer Science"],
    classes: ["Grade 7 - Section A"],
    students: 25
  },
  { 
    id: "T006", 
    name: "Mr. Jones", 
    email: "jones@school.edu", 
    phone: "(555) 678-9012", 
    subjects: ["Physical Education", "Health"],
    classes: ["Grade 7 - Section B"],
    students: 27
  },
];

export default function Teachers() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
    teacher.classes.some(cls => cls.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">
            Manage teachers and class assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-school-primary hover:bg-school-secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Teacher Directory</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search teachers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            View and manage teachers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-school-primary text-white">
                          {teacher.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {teacher.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{teacher.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{teacher.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {teacher.subjects.map((subject, i) => (
                        <Badge key={i} variant="outline" className="mr-1">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {teacher.classes.map((cls, i) => (
                        <Badge key={i} className="bg-school-light text-school-dark mr-1">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{teacher.students}</span>
                    </div>
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
                          <User className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
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
            Showing {filteredTeachers.length} of {teachers.length} teachers
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

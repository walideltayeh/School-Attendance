import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { dataService, Teacher, BusRoute } from "@/services/dataService";
import { PlusCircle, Trash, Save, BookOpen, Edit, X, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ClassAssignment {
  grade: string;
  section: string;
  subject: string;
  room: string; // Add room field to track classroom for attendance
}

interface AddTeacherFormProps {
  onSubmit: (teacher: Omit<Teacher, "id">, classAssignments: ClassAssignment[]) => void;
  initialValues?: Teacher;
  isEditing?: boolean;
  onCancel?: () => void;
}

const AddTeacherForm = ({ onSubmit, initialValues, isEditing = false, onCancel }: AddTeacherFormProps) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialValues?.subjects || []);
  const [classAssignments, setClassAssignments] = useState<ClassAssignment[]>(() => {
    if (initialValues?.classes?.length) {
      return initialValues.classes.map(cls => {
        // Parse the class string to extract information
        const match = cls.match(/(Grade \d+) - Section ([A-E]) \((.*)\)/);
        if (match) {
          const [, grade, section, subject] = match;
          // Find the room associated with this class
          const classInfo = dataService.getClasses().find(c => 
            c.name === `${grade} - Section ${section}` && 
            c.subject === subject);
          
          return { 
            grade, 
            section, 
            subject,
            room: classInfo?.room || "" 
          };
        }
        return { grade: "", section: "", subject: "", room: "" };
      }).filter(a => a.grade !== "");
    }
    return [{
      grade: "",
      section: "",
      subject: "",
      room: ""
    }];
  });

  const subjectOptions = [
    { label: "All", value: "All" },
    { label: "Mathematics", value: "Mathematics" },
    { label: "Science", value: "Science" },
    { label: "English", value: "English" },
    { label: "History", value: "History" },
    { label: "Geography", value: "Geography" },
    { label: "Computer Science", value: "Computer Science" },
    { label: "Physical Education", value: "Physical Education" },
    { label: "Art", value: "Art" },
    { label: "Music", value: "Music" },
  ];

  const classOptions = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const sectionOptions = ["A", "B", "C", "D", "E"];

  const handleAddClassAssignment = () => {
    setClassAssignments([...classAssignments, { grade: "", section: "", subject: "", room: "" }]);
  };

  const handleRemoveClassAssignment = (index: number) => {
    if (classAssignments.length > 1) {
      const newAssignments = [...classAssignments];
      newAssignments.splice(index, 1);
      setClassAssignments(newAssignments);
    }
  };

  const updateClassAssignment = (index: number, field: keyof ClassAssignment, value: string) => {
    const newAssignments = [...classAssignments];
    newAssignments[index][field] = value;
    setClassAssignments(newAssignments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone || selectedSubjects.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one class assignment is complete
    const hasCompleteAssignment = classAssignments.some(a => a.grade && a.section && a.subject && a.room);
    if (!hasCompleteAssignment) {
      toast({
        title: "Error",
        description: "Please assign at least one class with grade, section, subject and room",
        variant: "destructive",
      });
      return;
    }

    // Format class assignments as strings
    const formattedClasses = classAssignments
      .filter(a => a.grade && a.section && a.subject)
      .map(a => `${a.grade} - Section ${a.section} (${a.subject})`);
    
    const newTeacher: Omit<Teacher, "id"> = {
      name,
      email,
      phone,
      subject: selectedSubjects[0] || "", // Primary subject is the first one selected
      subjects: selectedSubjects,
      classes: formattedClasses,
      students: initialValues?.students || 0 // Keep the original student count if editing
    };
    
    onSubmit(newTeacher, classAssignments);
    
    // Reset form if not editing
    if (!isEditing) {
      setName("");
      setEmail("");
      setPhone("");
      setSelectedSubjects([]);
      setClassAssignments([{ grade: "", section: "", subject: "", room: "" }]);
    }

    toast({
      title: isEditing ? "Updated" : "Success",
      description: isEditing ? "Teacher updated successfully" : "Teacher added successfully",
    });

    // If we're editing and there's a cancel handler, call it
    if (isEditing && onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@school.edu"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(123) 456-7890"
          />
        </div>
        <div className="space-y-2">
          <Label>Subjects</Label>
          <MultiSelect
            options={subjectOptions}
            selected={selectedSubjects}
            onChange={setSelectedSubjects}
            placeholder="Select subjects"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Class Assignments</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddClassAssignment}
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Class
          </Button>
        </div>
        
        {classAssignments.map((assignment, index) => (
          <div key={index} className="border p-3 rounded-md space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <BookOpen className="h-4 w-4 text-primary" />
              <Label className="font-semibold">
                Assignment {index + 1}
              </Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`subject-${index}`}>Subject</Label>
                <Select 
                  value={assignment.subject} 
                  onValueChange={(value) => updateClassAssignment(index, "subject", value)}
                >
                  <SelectTrigger id={`subject-${index}`}>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`class-${index}`}>Class</Label>
                <Select 
                  value={assignment.grade} 
                  onValueChange={(value) => updateClassAssignment(index, "grade", value)}
                >
                  <SelectTrigger id={`class-${index}`}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`section-${index}`}>Section</Label>
                <Select 
                  value={assignment.section} 
                  onValueChange={(value) => updateClassAssignment(index, "section", value)}
                >
                  <SelectTrigger id={`section-${index}`}>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionOptions.map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`room-${index}`}>Room</Label>
                <Input
                  id={`room-${index}`}
                  value={assignment.room}
                  onChange={(e) => updateClassAssignment(index, "room", e.target.value)}
                  placeholder="Room 101"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveClassAssignment(index)}
                disabled={classAssignments.length <= 1}
                className="text-destructive"
              >
                <Trash className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2 justify-end">
        {isEditing && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className={isEditing ? "" : "w-full"}>
          <Save className="h-4 w-4 mr-2" /> {isEditing ? "Save Changes" : "Add Teacher"}
        </Button>
      </div>
    </form>
  );
};

interface AddBusRouteFormProps {
  onSubmit: (route: any) => void;
}

const AddBusRouteForm = ({ onSubmit }: AddBusRouteFormProps) => {
  const [routeName, setRouteName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [phone, setPhone] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!routeName || !driverName || !phone || !departureTime || !returnTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const newRoute: Omit<BusRoute, "id"> = {
      name: routeName,
      driver: driverName,
      phone: phone,
      departureTime: departureTime,
      returnTime: returnTime,
      students: 0,
      stops: 0,
      status: status
    };
    
    onSubmit(newRoute);
    
    // Reset form
    setRouteName("");
    setDriverName("");
    setPhone("");
    setDepartureTime("");
    setReturnTime("");
    setCapacity("");
    setStatus("active");

    toast({
      title: "Success",
      description: "Bus route added successfully",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="routeName">Route Name</Label>
          <Input
            id="routeName"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="North Route"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="driverName">Driver Name</Label>
          <Input
            id="driverName"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Michael Johnson"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="departureTime">Departure Time</Label>
          <Input
            id="departureTime"
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="returnTime">Return Time</Label>
          <Input
            id="returnTime"
            type="time"
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" /> Add Bus Route
      </Button>
    </form>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    // Load teachers when the component mounts
    setTeachers(dataService.getTeachers());
  }, []);

  const handleAddTeacher = (teacher: Omit<Teacher, "id">, classAssignments: ClassAssignment[]) => {
    const addedTeacher = dataService.addTeacher(teacher);
    console.log("Added teacher:", addedTeacher);
    
    // Add teacher's classes to the class list
    if (teacher.classes && teacher.classes.length > 0) {
      teacher.classes.forEach(className => {
        // Extract the subject from the end of the class name
        const match = className.match(/(.*) \((.*)\)$/);
        if (match) {
          const [, classNameWithoutSubject, subject] = match;
          const teacherName = addedTeacher.name;
          
          // Find the matching class assignment to get the room
          const classAssignment = classAssignments.find(ca => 
            `${ca.grade} - Section ${ca.section}` === classNameWithoutSubject && 
            ca.subject === subject
          );
          
          const room = classAssignment?.room || "Room " + Math.floor(Math.random() * 300 + 100); // Use assignment room or random
          
          dataService.addClass({
            name: classNameWithoutSubject,
            teacher: teacherName,
            room: room,
            subject: subject
          });
        }
      });
    }
    
    // Refresh the teachers list
    setTeachers(dataService.getTeachers());
    
    toast({
      title: "Teacher Added",
      description: `${teacher.name} has been added with ${teacher.classes.length} class assignments`,
    });
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeacher = (updatedTeacherData: Omit<Teacher, "id">, classAssignments: ClassAssignment[]) => {
    if (selectedTeacher) {
      // In a real application, you would update the teacher in the database
      const updatedTeacher = { 
        ...updatedTeacherData, 
        id: selectedTeacher.id 
      };
      
      // This is a simplified update that doesn't handle class changes
      // In a real app, you would need to also update classes
      const updatedTeachers = teachers.map(t => 
        t.id === selectedTeacher.id ? updatedTeacher : t
      );
      
      setTeachers(updatedTeachers);
      setIsEditDialogOpen(false);
      setSelectedTeacher(null);
      
      toast({
        title: "Teacher Updated",
        description: `${updatedTeacherData.name}'s information has been updated`,
      });
    }
  };

  const handleAddBusRoute = (route: Omit<BusRoute, "id">) => {
    const addedRoute = dataService.addBusRoute(route);
    console.log("Added bus route:", addedRoute);
    
    toast({
      title: "Bus Route Added",
      description: `${route.name} has been added with ${route.driver} as the driver`,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/students")}>
          Go to Students
        </Button>
        <Button variant="outline" onClick={() => navigate("/teachers")}>
          Go to Teachers
        </Button>
        <Button variant="outline" onClick={() => navigate("/students/register")}>
          Register Student
        </Button>
        <Button variant="outline" onClick={() => navigate("/transport")}>
          Transport
        </Button>
      </div>
      
      <Tabs defaultValue="teachers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="teachers">Manage Teachers</TabsTrigger>
          <TabsTrigger value="buses">Manage Bus Routes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Add New Teacher</CardTitle>
              <CardDescription>
                Enter teacher details to add them to the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddTeacherForm onSubmit={handleAddTeacher} />
            </CardContent>
          </Card>
          
          {teachers.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Teacher List</CardTitle>
                <CardDescription>
                  Edit or manage existing teachers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map(teacher => (
                    <div key={teacher.id} className="flex justify-between items-center p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">{teacher.name}</h3>
                        <p className="text-sm text-muted-foreground">{teacher.email} | {teacher.subjects.join(", ")}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEditTeacher(teacher)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="buses">
          <Card>
            <CardHeader>
              <CardTitle>Add New Bus Route</CardTitle>
              <CardDescription>
                Configure a new bus route for student transportation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddBusRouteForm onSubmit={handleAddBusRoute} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>
          {selectedTeacher && (
            <AddTeacherForm 
              onSubmit={handleUpdateTeacher} 
              initialValues={selectedTeacher}
              isEditing={true}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
          <DialogFooter className="sm:justify-start">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsEditDialogOpen(false)}
              className="mt-2 sm:mt-0"
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

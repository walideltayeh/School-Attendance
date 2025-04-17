
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "@/hooks/use-toast";
import { dataService, Teacher } from "@/services/dataService";
import { PlusCircle, Trash, Save, BookOpen, Eye, EyeOff } from "lucide-react";

interface ClassAssignment {
  grade: string;
  section: string;
  subject: string;
  room: string;
}

interface AddTeacherFormProps {
  onSubmit: (teacher: Omit<Teacher, "id">, classAssignments: ClassAssignment[]) => void;
  initialValues?: Teacher;
  isEditing?: boolean;
  onCancel?: () => void;
}

export function AddTeacherForm({ onSubmit, initialValues, isEditing = false, onCancel }: AddTeacherFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");
  const [username, setUsername] = useState(initialValues?.username || "");
  const [password, setPassword] = useState(initialValues?.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialValues?.subjects || []);
  const [classAssignments, setClassAssignments] = useState<ClassAssignment[]>(() => {
    if (initialValues?.classes?.length) {
      return initialValues.classes.map(cls => {
        const match = cls.match(/(Grade \d+) - Section ([A-E]) \((.*)\)/);
        if (match) {
          const [, grade, section, subject] = match;
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

  const validateRoomName = (roomName: string): boolean => {
    return dataService.isValidRoomName(roomName);
  };

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

    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please provide a username and password for teacher login",
        variant: "destructive",
      });
      return;
    }

    const hasCompleteAssignment = classAssignments.some(a => a.grade && a.section && a.subject && a.room);
    if (!hasCompleteAssignment) {
      toast({
        title: "Error",
        description: "Please assign at least one class with grade, section, subject and room",
        variant: "destructive",
      });
      return;
    }

    const invalidRooms = classAssignments
      .filter(a => a.room)
      .filter(a => !validateRoomName(a.room));
      
    if (invalidRooms.length > 0) {
      toast({
        title: "Invalid Room Name",
        description: "Room names must be in the format 'Room XX' where XX is a number between 01 and 100",
        variant: "destructive",
      });
      return;
    }

    const formattedClasses = classAssignments
      .filter(a => a.grade && a.section && a.subject)
      .map(a => `${a.grade} - Section ${a.section} (${a.subject})`);
    
    const newTeacher: Omit<Teacher, "id"> = {
      name,
      email,
      phone,
      username,
      password,
      subject: selectedSubjects[0] || "",
      subjects: selectedSubjects,
      classes: formattedClasses,
      students: initialValues?.students || 0
    };
    
    onSubmit(newTeacher, classAssignments);
    
    if (!isEditing) {
      setName("");
      setEmail("");
      setPhone("");
      setUsername("");
      setPassword("");
      setSelectedSubjects([]);
      setClassAssignments([{ grade: "", section: "", subject: "", room: "" }]);
    }

    toast({
      title: isEditing ? "Updated" : "Success",
      description: isEditing ? "Teacher updated successfully" : "Teacher added successfully",
    });

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
        <div className="space-y-2">
          <Label htmlFor="username">Username (for login)</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="jdoe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
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
                  placeholder="Room 01"
                  className={!validateRoomName(assignment.room) && assignment.room ? "border-destructive" : ""}
                />
                {!validateRoomName(assignment.room) && assignment.room && (
                  <p className="text-xs text-destructive">Must be between Room 01 and Room 100</p>
                )}
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
}

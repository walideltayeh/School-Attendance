
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "@/hooks/use-toast";
import { dataService, Teacher } from "@/services/dataService";
import { PlusCircle, Trash, Save, BookOpen, Eye, EyeOff } from "lucide-react";
import { getAvailableGrades, getAvailableSections, getAvailableSubjects } from "@/utils/classHelpers";

interface ClassAssignment {
  grade: string;
  section: string;
  subject: string;
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
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [classAssignments, setClassAssignments] = useState<ClassAssignment[]>(() => {
    if (initialValues?.classes?.length) {
      return initialValues.classes.map(cls => {
        const match = cls.match(/(Grade \d+) - Section ([A-E]) \((.*)\)/);
        if (match) {
          const [, grade, section, subject] = match;
          
          return { 
            grade, 
            section, 
            subject
          };
        }
        return { grade: "", section: "", subject: "" };
      }).filter(a => a.grade !== "");
    }
    return [{
      grade: "",
      section: "",
      subject: ""
    }];
  });

  // Load available grades on mount
  useEffect(() => {
    getAvailableGrades().then(grades => setAvailableGrades(grades));
  }, []);

  // Helper functions for getting sections and subjects (now async)
  const [gradeSections, setGradeSections] = useState<Record<string, string[]>>({});
  const [gradeSubjects, setGradeSubjects] = useState<Record<string, string[]>>({});
  
  const loadGradeSections = async (grade: string) => {
    if (!gradeSections[grade]) {
      const sections = await getAvailableSections(grade);
      setGradeSections(prev => ({ ...prev, [grade]: sections }));
    }
  };
  
  const loadGradeSubjects = async (grade: string, section: string) => {
    const key = `${grade}-${section}`;
    if (!gradeSubjects[key]) {
      const subjects = await getAvailableSubjects(grade, section);
      setGradeSubjects(prev => ({ ...prev, [key]: subjects }));
    }
  };

  const handleAddClassAssignment = () => {
    setClassAssignments([...classAssignments, { grade: "", section: "", subject: "" }]);
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
    
    // Load sections when grade is selected
    if (field === 'grade' && value) {
      loadGradeSections(value);
    }
    
    // Load subjects when section is selected
    if (field === 'section' && value && newAssignments[index].grade) {
      loadGradeSubjects(newAssignments[index].grade, value);
    }
    
    setClassAssignments(newAssignments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone) {
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

    const hasCompleteAssignment = classAssignments.some(a => a.grade && a.section && a.subject);
    if (!hasCompleteAssignment) {
      toast({
        title: "Error",
        description: "Please assign at least one class with grade, section, and subject",
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
      subject: "",
      subjects: [],
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
      setClassAssignments([{ grade: "", section: "", subject: "" }]);
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`class-${index}`}>Class</Label>
                <Select 
                  value={assignment.grade} 
                  onValueChange={(value) => {
                    updateClassAssignment(index, "grade", value);
                    updateClassAssignment(index, "section", "");
                    updateClassAssignment(index, "subject", "");
                  }}
                >
                  <SelectTrigger id={`class-${index}`}>
                    <SelectValue placeholder={availableGrades.length === 0 ? "No classes available" : "Select class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGrades.map((grade) => (
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
                  onValueChange={(value) => {
                    updateClassAssignment(index, "section", value);
                    updateClassAssignment(index, "subject", "");
                  }}
                  disabled={!assignment.grade}
                >
                  <SelectTrigger id={`section-${index}`}>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {(gradeSections[assignment.grade] || []).map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`subject-${index}`}>Subject</Label>
                <Select 
                  value={assignment.subject} 
                  onValueChange={(value) => updateClassAssignment(index, "subject", value)}
                  disabled={!assignment.grade || !assignment.section}
                >
                  <SelectTrigger id={`subject-${index}`}>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {(gradeSubjects[`${assignment.grade}-${assignment.section}`] || []).map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

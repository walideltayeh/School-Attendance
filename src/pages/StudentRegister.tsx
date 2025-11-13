
import { useState, useEffect } from "react";
import { QrCode, Save, ArrowLeft, User, FileDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { dataService, Teacher, ClassInfo, BusRoute } from "@/services/dataService";
import { getAvailableGrades, getAvailableSections } from "@/utils/classHelpers";

export default function StudentRegister() {
  const navigate = useNavigate();
  const [barcodeValue, setBarcodeValue] = useState("STU" + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  const [hasAllergies, setHasAllergies] = useState(false);
  const [requiresBus, setRequiresBus] = useState(false);
  
  // Student form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("female");
  const [bloodType, setBloodType] = useState("");
  const [allergyDetails, setAllergyDetails] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [teacher, setTeacher] = useState("");
  const [busRoute, setBusRoute] = useState("");
  
  // Loaded data
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);

  // Load data on component mount
  useEffect(() => {
    const loadedTeachers = dataService.getTeachers();
    const loadedClasses = dataService.getClasses();
    const loadedBusRoutes = dataService.getBusRoutes();
    
    setTeachers(loadedTeachers);
    setClasses(loadedClasses);
    setBusRoutes(loadedBusRoutes);
    
    // Get available grades from existing classes only
    setAvailableGrades(getAvailableGrades());
  }, []);

  // Update available sections when grade changes
  useEffect(() => {
    if (grade) {
      // Get available sections from existing classes only
      setAvailableSections(getAvailableSections(grade));
      
      // Reset teacher when grade changes
      setTeacher("");
      
      // Update filtered teachers for this grade
      updateFilteredTeachers(grade, "");
    }
  }, [grade, classes]);

  // Update available teachers when grade and section change
  useEffect(() => {
    if (grade && section) {
      updateFilteredTeachers(grade, section);
    }
  }, [section, teachers]);

  // Function to update filtered teachers based on grade and section
  const updateFilteredTeachers = (selectedGrade: string, selectedSection: string) => {
    const className = selectedSection 
      ? `${selectedGrade} - Section ${selectedSection}`
      : selectedGrade;
    
    const teachersForClass = teachers.filter(t => 
      t.classes.some(cls => cls.includes(className))
    );
    
    setFilteredTeachers(teachersForClass);
    
    // If a teacher is selected but not available for this class, reset selection
    if (teacher && !teachersForClass.some(t => t.name === teacher)) {
      setTeacher("");
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Form validation
    if (!firstName || !lastName || !grade || !section || !teacher || !bloodType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (hasAllergies && !allergyDetails) {
      toast({
        title: "Missing Information",
        description: "Please provide details about the allergies.",
        variant: "destructive"
      });
      return;
    }
    
    if (requiresBus && !busRoute) {
      toast({
        title: "Missing Information",
        description: "Please select a bus route.",
        variant: "destructive"
      });
      return;
    }
    
    // Create student object
    const newStudent = {
      name: `${firstName} ${lastName}`,
      grade: grade,
      section: section,
      teacher: teacher,
      bloodType: bloodType,
      allergies: hasAllergies,
      busRoute: requiresBus ? busRoute : "",
      status: "active" as const
    };
    
    // Add student to the database
    const addedStudent = dataService.addStudent(newStudent);
    
    // If student uses bus, add them to bus students
    if (requiresBus && busRoute) {
      const busRouteName = busRoutes.find(route => route.id === busRoute)?.name || "";
      dataService.addBusStudent({
        studentId: addedStudent.id,
        name: `${firstName} ${lastName}`,
        grade: grade,
        stop: "", // This would need to be set in a more detailed form
        status: "active"
      });
      
      toast({
        title: "Bus Assignment",
        description: `Student assigned to bus route: ${busRouteName}`,
      });
    }
    
    // Show success toast
    toast({
      title: "Student Registered Successfully",
      description: "The student information has been saved to the system.",
    });
    
    // Navigate back to students page
    navigate("/students");
  };

  const generateNewBarcode = () => {
    setBarcodeValue("STU" + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/students" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Register New Student</h2>
            <p className="text-muted-foreground">
              Enter student information and generate ID card/barcode
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Go to Admin
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Enter the basic information for the new student
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="studentId" className="text-right">
                    Student ID
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input id="studentId" value={barcodeValue} readOnly className="bg-muted" />
                    <Button type="button" variant="outline" onClick={generateNewBarcode}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
                    First Name
                  </Label>
                  <Input 
                    id="firstName" 
                    className="col-span-3" 
                    required 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Last Name
                  </Label>
                  <Input 
                    id="lastName" 
                    className="col-span-3" 
                    required 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dob" className="text-right">
                    Date of Birth
                  </Label>
                  <Input id="dob" type="date" className="col-span-3" required />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Gender</Label>
                  <RadioGroup 
                    value={gender} 
                    onValueChange={setGender} 
                    className="col-span-3 flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bloodType" className="text-right">
                    Blood Type
                  </Label>
                  <Select onValueChange={setBloodType} value={bloodType}>
                    <SelectTrigger id="bloodType" className="col-span-3">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Allergies</Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      checked={hasAllergies}
                      onCheckedChange={setHasAllergies}
                    />
                    <Label>Has allergies</Label>
                  </div>
                </div>
                
                {hasAllergies && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="allergyDetails" className="text-right">
                      Allergy Details
                    </Label>
                    <Textarea 
                      id="allergyDetails" 
                      className="col-span-3" 
                      placeholder="Please describe the allergies in detail..."
                      required={hasAllergies}
                      value={allergyDetails}
                      onChange={(e) => setAllergyDetails(e.target.value)}
                    />
                  </div>
                )}
                
                {/* Bus transportation section */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Bus Transportation</Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      checked={requiresBus}
                      onCheckedChange={setRequiresBus}
                    />
                    <Label>Requires bus transportation</Label>
                  </div>
                </div>
                
                {requiresBus && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="busRoute" className="text-right">
                      Bus Route
                    </Label>
                    <Select onValueChange={setBusRoute} value={busRoute}>
                      <SelectTrigger id="busRoute" className="col-span-3">
                        <SelectValue placeholder="Select bus route" />
                      </SelectTrigger>
                      <SelectContent>
                        {busRoutes
                          .filter(route => route.status === "active")
                          .map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.name} ({route.departureTime} - {route.returnTime})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardHeader>
              <CardTitle>Class Assignment</CardTitle>
              <CardDescription>
                {availableGrades.length === 0 
                  ? "No classes available. Please go to Admin → Manage Classes to create classes first."
                  : "Select a grade, section, and teacher"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="grade" className="text-right">
                    Grade
                  </Label>
                  <Select onValueChange={setGrade} value={grade} disabled={availableGrades.length === 0}>
                    <SelectTrigger id="grade" className="col-span-3">
                      <SelectValue placeholder={availableGrades.length === 0 ? "No classes available" : "Select grade"} />
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
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="section" className="text-right">
                    Section
                  </Label>
                  <Select onValueChange={setSection} value={section} disabled={!grade}>
                    <SelectTrigger id="section" className="col-span-3">
                      <SelectValue placeholder={grade ? "Select section" : "Select grade first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((section) => (
                        <SelectItem key={section} value={section}>
                          Section {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="teacher" className="text-right">
                    Teacher
                  </Label>
                  <Select onValueChange={setTeacher} value={teacher} disabled={!grade || !section}>
                    <SelectTrigger id="teacher" className="col-span-3">
                      <SelectValue placeholder={grade && section ? "Select teacher" : "Select grade and section first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.name}>
                          {teacher.name} - {teacher.subjects.join(", ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactName" className="text-right">
                    Contact Name
                  </Label>
                  <Input id="contactName" className="col-span-3" required />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactPhone" className="text-right">
                    Phone Number
                  </Label>
                  <Input id="contactPhone" className="col-span-3" required />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="relationship" className="text-right">
                    Relationship
                  </Label>
                  <Select>
                    <SelectTrigger id="relationship" className="col-span-3">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="relative">Relative</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Link to="/students">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" className="bg-school-primary hover:bg-school-secondary">
                <Save className="mr-2 h-4 w-4" />
                Register Student
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Student ID Card Preview</CardTitle>
            <CardDescription>
              This is a preview of the student ID card
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="border-2 border-school-primary p-6 rounded-lg w-full max-w-xs">
              <div className="bg-school-primary text-white text-center py-2 rounded-t-lg mb-4">
                <h3 className="font-bold">SCHOOL SCAN CONNECT</h3>
                <p className="text-xs">STUDENT IDENTIFICATION</p>
              </div>
              
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h4 className="font-bold">{firstName ? `${firstName} ${lastName}` : "New Student"}</h4>
                <p className="text-sm text-gray-600">ID: {barcodeValue}</p>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-3 text-sm">
                  <span className="font-medium">Grade:</span>
                  <span className="col-span-2">{grade || "Not Assigned"}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="font-medium">Teacher:</span>
                  <span className="col-span-2">{teacher || "Not Assigned"}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="font-medium">Blood Type:</span>
                  <span className="col-span-2">{bloodType || "Not Specified"}</span>
                </div>
                {requiresBus && (
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium">Bus Route:</span>
                    <span className="col-span-2">
                      {busRoute ? busRoutes.find(r => r.id === busRoute)?.name || "Not Specified" : "Not Specified"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="border border-dashed border-gray-300 p-3 flex justify-center">
                <QrCode className="h-24 w-24 text-school-primary" />
              </div>
              <div className="text-center mt-2 text-xs">Scan for attendance</div>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Download ID Card
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

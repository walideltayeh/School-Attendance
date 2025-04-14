
import { useState } from "react";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

export default function StudentRegister() {
  const navigate = useNavigate();
  const [barcodeValue, setBarcodeValue] = useState("STU" + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  const [hasAllergies, setHasAllergies] = useState(false);
  
  // Mock list of teachers for select box
  const teachers = [
    { id: "1", name: "Ms. Johnson" },
    { id: "2", name: "Mr. Davis" },
    { id: "3", name: "Ms. Adams" },
    { id: "4", name: "Mr. Taylor" },
    { id: "5", name: "Ms. Williams" },
    { id: "6", name: "Mr. Jones" },
  ];

  // Mock list of classes/grades
  const grades = ["Grade 5", "Grade 6", "Grade 7", "Grade 8"];
  const sections = ["A", "B", "C"];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, this would send the form data to an API
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
                  <Input id="firstName" className="col-span-3" required />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Last Name
                  </Label>
                  <Input id="lastName" className="col-span-3" required />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dob" className="text-right">
                    Date of Birth
                  </Label>
                  <Input id="dob" type="date" className="col-span-3" required />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Gender</Label>
                  <RadioGroup defaultValue="female" className="col-span-3 flex space-x-4">
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
                  <Select>
                    <SelectTrigger id="bloodType" className="col-span-3">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a_positive">A+</SelectItem>
                      <SelectItem value="a_negative">A-</SelectItem>
                      <SelectItem value="b_positive">B+</SelectItem>
                      <SelectItem value="b_negative">B-</SelectItem>
                      <SelectItem value="ab_positive">AB+</SelectItem>
                      <SelectItem value="ab_negative">AB-</SelectItem>
                      <SelectItem value="o_positive">O+</SelectItem>
                      <SelectItem value="o_negative">O-</SelectItem>
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
                      required
                    />
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardHeader>
              <CardTitle>Class Assignment</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="grade" className="text-right">
                    Grade
                  </Label>
                  <Select>
                    <SelectTrigger id="grade" className="col-span-3">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade.toLowerCase().replace(' ', '_')}>
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
                  <Select>
                    <SelectTrigger id="section" className="col-span-3">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section} value={section.toLowerCase()}>
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
                  <Select>
                    <SelectTrigger id="teacher" className="col-span-3">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
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
                <h4 className="font-bold">New Student</h4>
                <p className="text-sm text-gray-600">ID: {barcodeValue}</p>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-3 text-sm">
                  <span className="font-medium">Grade:</span>
                  <span className="col-span-2">Not Assigned</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="font-medium">Teacher:</span>
                  <span className="col-span-2">Not Assigned</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="font-medium">Blood Type:</span>
                  <span className="col-span-2">Not Specified</span>
                </div>
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

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
import { toast } from "@/hooks/use-toast";
import { dataService, ClassInfo, BusRoute } from "@/services/dataService";
import { getAvailableGrades, getAvailableSections } from "@/utils/classHelpers";
import { supabase } from "@/integrations/supabase/client";

export default function StudentRegister() {
  const navigate = useNavigate();
  const [barcodeValue, setBarcodeValue] = useState("STU" + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  const [hasAllergies, setHasAllergies] = useState(false);
  const [requiresBus, setRequiresBus] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  
  // Student form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("female");
  const [bloodType, setBloodType] = useState("");
  const [allergyDetails, setAllergyDetails] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [busRoute, setBusRoute] = useState("");
  
  // Guardian form state
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("");
  
  // Loaded data
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const loadedClasses = dataService.getClasses();
      setClasses(loadedClasses);
      
      // Fetch bus routes from Supabase
      const { data: routes, error } = await supabase
        .from('bus_routes')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        console.error("Error loading bus routes:", error);
        toast({
          title: "Error",
          description: "Failed to load bus routes",
          variant: "destructive"
        });
      } else {
        // Map Supabase data to BusRoute type
        const mappedRoutes = routes?.map(route => ({
          id: route.id,
          name: route.name,
          driver: route.driver_name,
          phone: route.driver_phone,
          departureTime: route.departure_time,
          returnTime: route.return_time,
          students: 0,
          stops: 0,
          status: route.status
        })) || [];
        setBusRoutes(mappedRoutes);
      }
      
      getAvailableGrades().then(grades => setAvailableGrades(grades));
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (grade) {
      getAvailableSections(grade).then(sections => setAvailableSections(sections));
    }
  }, [grade, classes]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Photo must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!firstName || !lastName || !grade || !section || !bloodType) {
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
    
    try {
      let photoUrl = null;
      
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${barcodeValue}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('student-photos')
          .upload(fileName, photoFile);

        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          toast({
            title: "Photo Upload Failed",
            description: "Student will be registered without photo",
            variant: "default"
          });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('student-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrl;
        }
      }
      
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert({
          student_code: barcodeValue,
          full_name: `${firstName} ${lastName}`,
          grade: grade,
          section: section,
          blood_type: bloodType,
          allergies: hasAllergies,
          allergies_details: hasAllergies ? allergyDetails : null,
          status: 'active',
          photo_url: photoUrl
        } as any)
        .select()
        .single();

      if (studentError) {
        console.error('Error creating student:', studentError);
        toast({
          title: "Error",
          description: "Failed to register student",
          variant: "destructive"
        });
        return;
      }

      if (requiresBus && busRoute && newStudent) {
        const { error: busError } = await supabase
          .from('bus_assignments')
          .insert({
            student_id: newStudent.id,
            route_id: busRoute,
            stop_id: busRoute,
            status: 'active'
          } as any);

        if (busError) {
          console.error('Error assigning bus:', busError);
        }
      }
      
      toast({
        title: "Student Registered Successfully",
        description: "The student information has been saved to the system.",
      });
      
      navigate("/students");
    } catch (error) {
      console.error('Error registering student:', error);
      toast({
        title: "Error",
        description: "Failed to register student",
        variant: "destructive"
      });
    }
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
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Photo</CardTitle>
                <CardDescription>Upload a photo for identification (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Student preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="photo">Student Photo</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Max 5MB. JPG, PNG, WEBP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
                <CardDescription>
                  Enter the basic information for the new student
                </CardDescription>
              </CardHeader>
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
                    <Label htmlFor="grade" className="text-right">
                      Grade
                    </Label>
                    <Select onValueChange={setGrade} value={grade}>
                      <SelectTrigger id="grade" className="col-span-3">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGrades.map(g => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
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
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSections.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Has Allergies</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        checked={hasAllergies}
                        onCheckedChange={setHasAllergies}
                      />
                      <Label className="text-sm text-muted-foreground">
                        Student has known allergies
                      </Label>
                    </div>
                  </div>
                  
                  {hasAllergies && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="allergies" className="text-right">
                        Allergy Details
                      </Label>
                      <Textarea 
                        id="allergies" 
                        placeholder="Describe the allergies..." 
                        className="col-span-3" 
                        value={allergyDetails}
                        onChange={(e) => setAllergyDetails(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Requires Bus</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        checked={requiresBus}
                        onCheckedChange={setRequiresBus}
                      />
                      <Label className="text-sm text-muted-foreground">
                        Student will use school bus
                      </Label>
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
                          {busRoutes.map(route => (
                            <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Guardian Information</CardTitle>
                <CardDescription>
                  Enter guardian or parent contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guardianRelation" className="text-right">
                      Relationship
                    </Label>
                    <Select onValueChange={setGuardianRelation} value={guardianRelation}>
                      <SelectTrigger id="guardianRelation" className="col-span-3">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guardianName" className="text-right">
                      Full Name
                    </Label>
                    <Input 
                      id="guardianName" 
                      className="col-span-3" 
                      placeholder="Guardian's full name"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guardianEmail" className="text-right">
                      Email
                    </Label>
                    <Input 
                      id="guardianEmail" 
                      type="email" 
                      className="col-span-3" 
                      placeholder="guardian@example.com"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guardianPhone" className="text-right">
                      Phone
                    </Label>
                    <Input 
                      id="guardianPhone" 
                      type="tel" 
                      className="col-span-3" 
                      placeholder="+1 (555) 000-0000"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/students">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" className="bg-school-primary hover:bg-school-secondary">
                  <Save className="mr-2 h-4 w-4" />
                  Register Student
                </Button>
              </CardFooter>
            </Card>
          </div>
          
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
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-2 overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
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
                    <span className="font-medium">Section:</span>
                    <span className="col-span-2">{section || "Not Assigned"}</span>
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
              <Button variant="outline" type="button">
                <FileDown className="mr-2 h-4 w-4" />
                Download ID Card
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}

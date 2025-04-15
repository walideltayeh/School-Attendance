
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MultiSelect } from "@/components/ui/multi-select";

interface AddTeacherFormProps {
  onSubmit: (teacher: any) => void;
}

const AddTeacherForm = ({ onSubmit }: AddTeacherFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const subjectOptions = [
    { label: "Mathematics", value: "mathematics" },
    { label: "Science", value: "science" },
    { label: "English", value: "english" },
    { label: "History", value: "history" },
    { label: "Geography", value: "geography" },
    { label: "Computer Science", value: "computer-science" },
    { label: "Physical Education", value: "physical-education" },
    { label: "Art", value: "art" },
    { label: "Music", value: "music" },
  ];

  const classOptions = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const sectionOptions = ["A", "B", "C", "D", "E"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone || selectedSubjects.length === 0 || !selectedClass || !selectedSection) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const classAssignment = `${selectedClass} - Section ${selectedSection}`;
    
    const newTeacher = {
      name,
      email,
      phone,
      subjects: selectedSubjects,
      classes: [classAssignment],
      students: []
    };
    
    onSubmit(newTeacher);
    
    // Reset form
    setName("");
    setEmail("");
    setPhone("");
    setSelectedSubjects([]);
    setSelectedClass("");
    setSelectedSection("");

    toast({
      title: "Success",
      description: "Teacher added successfully",
    });
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
          <Label htmlFor="class">Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger id="class">
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
          <Label htmlFor="section">Section</Label>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger id="section">
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
      </div>
      <Button type="submit" className="w-full">Add Teacher</Button>
    </form>
  );
};

interface AddBusRouteFormProps {
  onSubmit: (route: any) => void;
}

const AddBusRouteForm = ({ onSubmit }: AddBusRouteFormProps) => {
  const [routeName, setRouteName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!routeName || !driverName || !busNumber || !capacity || !startLocation || !endLocation || !departureTime) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    const newRoute = {
      routeName,
      driverName,
      busNumber,
      capacity: parseInt(capacity),
      startLocation,
      endLocation,
      departureTime,
      students: []
    };
    
    onSubmit(newRoute);
    
    // Reset form
    setRouteName("");
    setDriverName("");
    setBusNumber("");
    setCapacity("");
    setStartLocation("");
    setEndLocation("");
    setDepartureTime("");

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
          <Label htmlFor="busNumber">Bus Number</Label>
          <Input
            id="busNumber"
            value={busNumber}
            onChange={(e) => setBusNumber(e.target.value)}
            placeholder="BUS-123"
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
          <Label htmlFor="startLocation">Start Location</Label>
          <Input
            id="startLocation"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            placeholder="Downtown Station"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endLocation">End Location</Label>
          <Input
            id="endLocation"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            placeholder="School Campus"
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
      </div>
      <Button type="submit" className="w-full">Add Bus Route</Button>
    </form>
  );
};

const Admin = () => {
  const handleAddTeacher = (teacher: any) => {
    console.log("Adding teacher:", teacher);
    // Here you would typically send the data to your API
  };

  const handleAddBusRoute = (route: any) => {
    console.log("Adding bus route:", route);
    // Here you would typically send the data to your API
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
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
    </div>
  );
};

export default Admin;

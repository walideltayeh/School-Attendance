
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { dataService, Teacher, BusRoute, ClassSchedule, ClassInfo } from "@/services/dataService";
import { PlusCircle, Edit, X, Calendar, Pencil, Trash, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ClassPeriodsForm } from "@/components/admin/ClassPeriodsForm";
import { ClassScheduleForm } from "@/components/admin/ClassScheduleForm";
import { AddTeacherForm } from "@/components/admin/AddTeacherForm";
import { AddBusRouteForm } from "@/components/admin/AddBusRouteForm";
import { AddClassForm } from "@/components/admin/AddClassForm";
import { SubjectManagement } from "@/components/admin/SubjectManagement";

const Admin = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);
  const [isScheduleEditDialogOpen, setIsScheduleEditDialogOpen] = useState(false);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [isClassEditDialogOpen, setIsClassEditDialogOpen] = useState(false);
  
  useEffect(() => {
    setTeachers(dataService.getTeachers());
    setSchedules(dataService.getClassSchedules());
    setClasses(dataService.getClasses());
  }, []);

  const handleAddTeacher = (teacher: Omit<Teacher, "id">, classAssignments: any[]) => {
    const addedTeacher = dataService.addTeacher(teacher);
    console.log("Added teacher:", addedTeacher);
    
    if (teacher.classes && teacher.classes.length > 0) {
      teacher.classes.forEach(className => {
        const match = className.match(/(.*) \((.*)\)$/);
        if (match) {
          const [, classNameWithoutSubject, subject] = match;
          const teacherName = addedTeacher.name;
          
          const classAssignment = classAssignments.find(ca => 
            `${ca.grade} - Section ${ca.section}` === classNameWithoutSubject && 
            ca.subject === subject
          );
          
          const room = classAssignment?.room || "Room " + Math.floor(Math.random() * 300 + 100);
          
          dataService.addClass({
            name: classNameWithoutSubject,
            teacher: teacherName,
            room: room,
            subject: subject
          });
        }
      });
    }
    
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

  const handleUpdateTeacher = (updatedTeacherData: Omit<Teacher, "id">, classAssignments: any[]) => {
    if (selectedTeacher) {
      const updatedTeacher = { 
        ...updatedTeacherData, 
        id: selectedTeacher.id 
      };
      
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

  const handleAddSchedule = (schedule: Omit<ClassSchedule, "id">) => {
    const addedSchedule = dataService.addClassSchedule(schedule);
    console.log("Added schedule:", addedSchedule);
    setSchedules(dataService.getClassSchedules());
  };

  const handleEditSchedule = (schedule: ClassSchedule) => {
    setSelectedSchedule(schedule);
    setIsScheduleEditDialogOpen(true);
  };

  const handleUpdateSchedule = (updatedSchedule: Omit<ClassSchedule, "id">) => {
    if (selectedSchedule) {
      // Delete the old schedule
      const filteredSchedules = schedules.filter(s => s.id !== selectedSchedule.id);
      
      // Add the updated schedule
      const newSchedule = {
        ...updatedSchedule,
        id: selectedSchedule.id
      };
      
      // Update locally
      setSchedules([...filteredSchedules, newSchedule]);
      
      // Close dialog
      setIsScheduleEditDialogOpen(false);
      setSelectedSchedule(null);
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
    setSchedules(updatedSchedules);
    
    toast({
      title: "Schedule Deleted",
      description: "The schedule has been removed",
    });
  };

  const handleAddClass = (classData: any) => {
    const addedClass = dataService.addClass(classData);
    setClasses(dataService.getClasses());
    
    toast({
      title: "Class Added",
      description: `${classData.name} (${classData.subject}) has been created`,
    });
  };

  const handleEditClass = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setIsClassEditDialogOpen(true);
  };

  const handleUpdateClass = (updatedClassData: any) => {
    if (selectedClass) {
      const updatedClasses = classes.map(c => 
        c.id === selectedClass.id ? { ...updatedClassData, id: selectedClass.id } : c
      );
      setClasses(updatedClasses);
      setIsClassEditDialogOpen(false);
      setSelectedClass(null);
      
      toast({
        title: "Class Updated",
        description: "Class information has been updated",
      });
    }
  };

  const handleDeleteClass = (classId: string) => {
    const updatedClasses = classes.filter(c => c.id !== classId);
    setClasses(updatedClasses);
    
    toast({
      title: "Class Deleted",
      description: "The class has been removed",
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
        <Button variant="outline" onClick={() => navigate("/calendar")}>
          Calendar
        </Button>
      </div>
      
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="classes">
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Classes
          </TabsTrigger>
          <TabsTrigger value="teachers">Manage Teachers</TabsTrigger>
          <TabsTrigger value="buses">Bus Routes</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="periods">Periods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="classes">
          <SubjectManagement />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Add New Class</CardTitle>
              <CardDescription>
                Create classes by selecting grade, section, and subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddClassForm onSubmit={handleAddClass} />
            </CardContent>
          </Card>
          
          {classes.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Class List</CardTitle>
                <CardDescription>
                  Manage existing classes, grades, sections, and subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.map(classInfo => (
                    <div key={classInfo.id} className="flex justify-between items-center p-4 border rounded-md hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{classInfo.name}</h3>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span><strong>Subject:</strong> {classInfo.subject}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClass(classInfo)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClass(classInfo.id)}>
                          <Trash className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
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
                        {teacher.username && (
                          <p className="text-xs text-muted-foreground">Username: {teacher.username}</p>
                        )}
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
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Class Scheduling</CardTitle>
              <CardDescription>
                Create and manage the school timetable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClassScheduleForm onSubmit={handleAddSchedule} />
            </CardContent>
          </Card>
          
          {schedules.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Current Schedules</CardTitle>
                <CardDescription>
                  View and manage classroom assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="border rounded-md p-3 hover:shadow-md transition-shadow relative">
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => handleEditSchedule(schedule)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive" 
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">{schedule.day} - Period {schedule.period}</span>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full ml-auto">Week {schedule.week}</span>
                      </div>
                      <div className="text-sm space-y-1 mt-2">
                        <p><span className="text-muted-foreground">Teacher:</span> {schedule.teacherName}</p>
                        <p><span className="text-muted-foreground">Class:</span> {schedule.className}</p>
                        <p><span className="text-muted-foreground">Room:</span> {schedule.roomName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="periods">
          <Card>
            <CardHeader>
              <CardTitle>Class Period Times</CardTitle>
              <CardDescription>
                Configure the start and end times for each class period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClassPeriodsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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

      <Dialog open={isScheduleEditDialogOpen} onOpenChange={setIsScheduleEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <ClassScheduleForm 
              onSubmit={handleUpdateSchedule} 
              editingSchedule={selectedSchedule}
              onCancelEdit={() => setIsScheduleEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isClassEditDialogOpen} onOpenChange={setIsClassEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <AddClassForm 
              onSubmit={handleUpdateClass} 
              initialValues={{
                id: selectedClass.id,
                name: selectedClass.name,
                grade: selectedClass.name.split(' - ')[0],
                section: selectedClass.name.split('Section ')[1],
                subjects: [selectedClass.subject]
              }}
              isEditing={true}
              onCancel={() => setIsClassEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

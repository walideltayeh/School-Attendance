
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { dataService, Teacher, BusRoute, ClassSchedule, ClassInfo } from "@/services/dataService";
import { PlusCircle, Edit, X, Calendar, Pencil, Trash, BookOpen, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classGroupToDelete, setClassGroupToDelete] = useState<string | null>(null);
  const [editingClassName, setEditingClassName] = useState<string | null>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [duplicateSourceClass, setDuplicateSourceClass] = useState<string | null>(null);
  const [duplicateTargetGrade, setDuplicateTargetGrade] = useState("");
  const [duplicateTargetSection, setDuplicateTargetSection] = useState("");
  
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

  const handleAddClass = (classData: { grades: string[]; sections: string[]; subjects: string[] }) => {
    // Create a class for each combination of grade, section, and subject
    const createdClasses: string[] = [];
    const newClasses: any[] = [];
    
    classData.grades.forEach(grade => {
      classData.sections.forEach(section => {
        const className = `${grade} - Section ${section}`;
        classData.subjects.forEach(subject => {
          const addedClass = dataService.addClass({
            name: className,
            teacher: "Unassigned",
            room: "TBD",
            subject: subject
          });
          newClasses.push(addedClass);
          createdClasses.push(`${className} (${subject})`);
        });
      });
    });
    
    // Force immediate state update with the new classes
    setClasses(prevClasses => [...prevClasses, ...newClasses]);
    
    toast({
      title: "Classes Created",
      description: `Created ${createdClasses.length} class${createdClasses.length > 1 ? 'es' : ''} successfully`,
    });
  };

  const handleDuplicateClassGroup = (className: string) => {
    setDuplicateSourceClass(className);
    setIsDuplicateDialogOpen(true);
  };

  const confirmDuplicateClassGroup = () => {
    if (!duplicateSourceClass || !duplicateTargetGrade || !duplicateTargetSection) {
      toast({
        title: "Error",
        description: "Please select both target grade and section",
        variant: "destructive",
      });
      return;
    }

    const targetClassName = `${duplicateTargetGrade} - Section ${duplicateTargetSection}`;
    
    // Check if target already exists
    const existingTargetClasses = classes.filter(c => c.name === targetClassName);
    if (existingTargetClasses.length > 0) {
      toast({
        title: "Error",
        description: `${targetClassName} already exists. Please choose a different target.`,
        variant: "destructive",
      });
      return;
    }

    // Get subjects from source class
    const sourceSubjects = classes
      .filter(c => c.name === duplicateSourceClass)
      .map(c => c.subject);

    // Create new classes with same subjects
    const newClasses: ClassInfo[] = sourceSubjects.map(subject => ({
      id: `${Date.now()}-${Math.random()}`,
      name: targetClassName,
      teacher: "Unassigned",
      room: "TBD",
      subject: subject
    }));

    setClasses([...classes, ...newClasses]);
    
    toast({
      title: "Class Group Duplicated",
      description: `Created ${targetClassName} with ${sourceSubjects.length} subject(s)`,
    });

    // Reset state
    setIsDuplicateDialogOpen(false);
    setDuplicateSourceClass(null);
    setDuplicateTargetGrade("");
    setDuplicateTargetSection("");
  };

  const handleDeleteClassGroup = (className: string) => {
    setClassGroupToDelete(className);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteClassGroup = () => {
    if (!classGroupToDelete) return;
    
    const classesToDelete = classes.filter(c => c.name === classGroupToDelete);
    const updatedClasses = classes.filter(c => c.name !== classGroupToDelete);
    setClasses(updatedClasses);
    
    toast({
      title: "Class Group Deleted",
      description: `${classGroupToDelete} with ${classesToDelete.length} subject(s) removed`,
    });
    
    setDeleteConfirmOpen(false);
    setClassGroupToDelete(null);
  };

  const handleEditClassGroup = (className: string) => {
    setEditingClassName(className);
    const classGroup = classes.filter(c => c.name === className);
    if (classGroup.length > 0) {
      const firstClass = classGroup[0];
      const [grade, sectionPart] = firstClass.name.split(' - Section ');
      const subjects = classGroup.map(c => c.subject);
      
      setSelectedClass({
        ...firstClass,
        name: className,
        subject: subjects.join(', ')
      });
      setIsClassEditDialogOpen(true);
    }
  };

  const handleUpdateClassGroup = (updatedData: { grades: string[]; sections: string[]; subjects: string[] }) => {
    if (!editingClassName) return;
    
    // Remove old classes for this group
    const updatedClasses = classes.filter(c => c.name !== editingClassName);
    
    // Add new classes with updated subjects
    const newClasses: ClassInfo[] = [];
    updatedData.grades.forEach(grade => {
      updatedData.sections.forEach(section => {
        const className = `${grade} - Section ${section}`;
        updatedData.subjects.forEach(subject => {
          newClasses.push({
            id: `${Date.now()}-${Math.random()}`,
            name: className,
            teacher: "Unassigned",
            room: "TBD",
            subject: subject
          });
        });
      });
    });
    
    setClasses([...updatedClasses, ...newClasses]);
    setIsClassEditDialogOpen(false);
    setEditingClassName(null);
    setSelectedClass(null);
    
    toast({
      title: "Class Group Updated",
      description: `Updated subjects for ${editingClassName}`,
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
                  {(() => {
                    // Group classes by grade-section combination
                    const grouped = classes.reduce((acc, classInfo) => {
                      const key = classInfo.name; // e.g., "Grade 1 - Section A"
                      if (!acc[key]) {
                        acc[key] = [];
                      }
                      acc[key].push(classInfo);
                      return acc;
                    }, {} as Record<string, typeof classes>);

                    return Object.entries(grouped)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([className, classGroup]) => (
                        <div key={className} className="border rounded-lg p-4 bg-card">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{className}</h3>
                              <Badge variant="outline">{classGroup.length} subject{classGroup.length > 1 ? 's' : ''}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditClassGroup(className)}
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDuplicateClassGroup(className)}
                              >
                                <Copy className="h-4 w-4 mr-1" /> Duplicate
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteClassGroup(className)}
                              >
                                <Trash className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {classGroup.map(classInfo => (
                              <Badge 
                                key={classInfo.id} 
                                variant="secondary" 
                                className="text-sm py-2 px-3 flex items-center gap-2"
                              >
                                {classInfo.subject}
                                <button
                                  onClick={() => {
                                    const updatedClasses = classes.filter(c => c.id !== classInfo.id);
                                    setClasses(updatedClasses);
                                    toast({
                                      title: "Subject Removed",
                                      description: `${classInfo.subject} removed from ${className}`,
                                    });
                                  }}
                                  className="ml-1 hover:text-destructive transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ));
                  })()}
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
            <DialogTitle>Edit Class Group - {editingClassName}</DialogTitle>
          </DialogHeader>
          {selectedClass && editingClassName && (
            <AddClassForm 
              onSubmit={handleUpdateClassGroup} 
              initialValues={{
                id: selectedClass.id,
                name: selectedClass.name,
                grade: editingClassName.split(' - ')[0],
                section: editingClassName.split('Section ')[1],
                subjects: classes.filter(c => c.name === editingClassName).map(c => c.subject)
              }}
              isEditing={true}
              onCancel={() => {
                setIsClassEditDialogOpen(false);
                setEditingClassName(null);
                setSelectedClass(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {classGroupToDelete} and all {classes.filter(c => c.name === classGroupToDelete).length} subject(s) assigned to it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmOpen(false);
              setClassGroupToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClassGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Duplicate Class Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Source Class</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{duplicateSourceClass}</p>
                <p className="text-sm text-muted-foreground">
                  {classes.filter(c => c.name === duplicateSourceClass).length} subject(s) will be copied
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-grade">Target Grade</Label>
                <Select value={duplicateTargetGrade} onValueChange={setDuplicateTargetGrade}>
                  <SelectTrigger id="target-grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {["KG1", "KG2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-section">Target Section</Label>
                <Select value={duplicateTargetSection} onValueChange={setDuplicateTargetSection}>
                  <SelectTrigger id="target-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D", "E", "F"].map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDuplicateDialogOpen(false);
                setDuplicateSourceClass(null);
                setDuplicateTargetGrade("");
                setDuplicateTargetSection("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmDuplicateClassGroup}>
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

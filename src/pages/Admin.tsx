
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
import { supabase } from "@/integrations/supabase/client";

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
    console.log('Admin component mounted, loading data...');
    loadTeachers();
    setSchedules(dataService.getClassSchedules());
    loadClasses();

    // Subscribe to real-time updates for classes
    const classesChannel = supabase
      .channel('classes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes'
        },
        () => {
          console.log('Classes changed, reloading...');
          loadClasses();
        }
      )
      .subscribe();

    // Subscribe to real-time updates for teachers
    const teachersChannel = supabase
      .channel('teachers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teachers'
        },
        () => {
          console.log('Teachers changed, reloading...');
          loadTeachers();
        }
      )
      .subscribe();

    // Also reload when component becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, reloading data...');
        loadClasses();
        loadTeachers();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('Admin component unmounting...');
      supabase.removeChannel(classesChannel);
      supabase.removeChannel(teachersChannel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('grade', { ascending: true })
      .order('section', { ascending: true });
    
    if (error) {
      console.error('Error loading classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
      return;
    }

    // Transform database format to match ClassInfo interface
    const transformedClasses = (data || []).map((cls: any) => ({
      id: cls.id,
      name: `${cls.grade} - Section ${cls.section}`,
      teacher: 'Unassigned',
      room: cls.room_number || 'TBD',
      subject: cls.subject
    }));

    console.log('Loaded classes from database:', transformedClasses);
    setClasses(transformedClasses);
  };

  const loadTeachers = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        id,
        teacher_code,
        subjects,
        profiles:user_id (
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
      return;
    }

    const transformedTeachers: Teacher[] = (data || []).map((teacher: any) => ({
      id: teacher.id,
      name: teacher.profiles?.full_name || 'Unknown',
      email: teacher.profiles?.email || '',
      phone: teacher.profiles?.phone || '',
      username: teacher.teacher_code,
      password: '',
      subject: teacher.subjects?.[0] || '',
      subjects: teacher.subjects || [],
      classes: teacher.subjects || [],
      students: 0
    }));

    console.log('Loaded teachers from database:', transformedTeachers);
    setTeachers(transformedTeachers);
  };

  const handleAddTeacher = async (teacher: Omit<Teacher, "id">, classAssignments: any[]) => {
    try {
      // Generate a secure password (minimum 6 characters required by Supabase)
      const generatedPassword = teacher.password && teacher.password.length >= 6 
        ? teacher.password 
        : `Teacher${Date.now()}`;
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: teacher.email,
        password: generatedPassword,
        options: {
          data: {
            full_name: teacher.name
          }
        }
      });

      if (authError || !authData.user) {
        console.error('Error creating auth user:', authError);
        toast({
          title: "Error",
          description: authError?.message || "Failed to create teacher account",
          variant: "destructive"
        });
        return;
      }

      // Create teacher record
      const { error: teacherError } = await supabase
        .from('teachers')
        .insert({
          user_id: authData.user.id,
          teacher_code: teacher.username,
          subjects: classAssignments.map(ca => ca.subject).filter(Boolean)
        });

      if (teacherError) {
        console.error('Error creating teacher:', teacherError);
        toast({
          title: "Error",
          description: "Failed to create teacher record",
          variant: "destructive"
        });
        return;
      }

      // Assign teacher role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'teacher'
        });

      if (roleError) {
        console.error('Error assigning role:', roleError);
      }

      toast({
        title: "Teacher Added",
        description: `${teacher.name} has been added successfully`,
      });
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Error",
        description: "Failed to add teacher",
        variant: "destructive"
      });
    }
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

  const handleAddClass = async (classData: { grades: string[]; sections: string[]; subjects: string[] }) => {
    console.log("handleAddClass called with:", classData);
    
    // Create a class for each combination of grade, section, and subject
    const classesToInsert = [];
    
    for (const grade of classData.grades) {
      for (const section of classData.sections) {
        for (const subject of classData.subjects) {
          classesToInsert.push({
            name: `${grade} - Section ${section}`,
            grade: grade,
            section: section,
            teacher_id: null,
            room_number: "TBD",
            subject: subject
          });
        }
      }
    }
    
    console.log("Inserting classes:", classesToInsert);
    
    const { data, error } = await supabase
      .from('classes')
      .insert(classesToInsert)
      .select();
    
    if (error) {
      console.error("Error adding classes:", error);
      toast({
        title: "Error",
        description: "Failed to create classes: " + error.message,
        variant: "destructive",
      });
      return;
    }
    
    console.log("Classes created successfully:", data);
    
    // Reload classes to update UI
    await loadClasses();
    
    toast({
      title: "Classes Created",
      description: `Created ${classesToInsert.length} class${classesToInsert.length > 1 ? 'es' : ''} successfully`,
    });
  };

  const handleDuplicateClassGroup = (className: string) => {
    setDuplicateSourceClass(className);
    setIsDuplicateDialogOpen(true);
  };

  const confirmDuplicateClassGroup = async () => {
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

    // Create new classes with same subjects in Supabase
    const classesToInsert = sourceSubjects.map(subject => ({
      name: targetClassName,
      grade: duplicateTargetGrade,
      section: duplicateTargetSection,
      teacher_id: null,
      room_number: "TBD",
      subject: subject
    }));

    const { error } = await supabase
      .from('classes')
      .insert(classesToInsert);

    if (error) {
      console.error("Error duplicating classes:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate class group",
        variant: "destructive"
      });
      return;
    }
    
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

  const confirmDeleteClassGroup = async () => {
    if (!classGroupToDelete) return;
    
    const classesToDelete = classes.filter(c => c.name === classGroupToDelete);
    const classIds = classesToDelete.map(c => c.id);
    
    // Delete from Supabase
    const { error } = await supabase
      .from('classes')
      .delete()
      .in('id', classIds);

    if (error) {
      console.error("Error deleting classes:", error);
      toast({
        title: "Error",
        description: "Failed to delete class group",
        variant: "destructive"
      });
      return;
    }
    
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

  const handleUpdateClassGroup = async (updatedData: { grades: string[]; sections: string[]; subjects: string[] }) => {
    if (!editingClassName) return;
    
    const newGrade = updatedData.grades[0];
    const newSection = updatedData.sections[0];
    const newClassName = `${newGrade} - Section ${newSection}`;
    const oldClasses = classes.filter(c => c.name === editingClassName);
    
    // Determine which subjects to keep, update, or add
    const oldSubjects = oldClasses.map(c => c.subject);
    const newSubjects = updatedData.subjects;
    
    try {
      // Update existing classes if grade/section changed
      if (editingClassName !== newClassName) {
        // Update classes that should remain
        const classesToUpdate = oldClasses.filter(c => newSubjects.includes(c.subject));
        if (classesToUpdate.length > 0) {
          const { error: updateError } = await supabase
            .from('classes')
            .update({ 
              name: newClassName,
              grade: newGrade,
              section: newSection
            })
            .in('id', classesToUpdate.map(c => c.id));

          if (updateError) throw updateError;
        }

        // Delete classes with removed subjects
        const classesToDelete = oldClasses.filter(c => !newSubjects.includes(c.subject));
        if (classesToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('classes')
            .delete()
            .in('id', classesToDelete.map(c => c.id));

          if (deleteError) throw deleteError;
        }
        
        // Add new subjects
        const subjectsToAdd = newSubjects.filter(s => !oldSubjects.includes(s));
        if (subjectsToAdd.length > 0) {
          const { error: insertError } = await supabase
            .from('classes')
            .insert(subjectsToAdd.map(subject => ({
              name: newClassName,
              grade: newGrade,
              section: newSection,
              teacher_id: null,
              room_number: "TBD",
              subject: subject
            })));

          if (insertError) throw insertError;
        }
      } else {
        // Only subjects changed, same grade/section
        // Delete removed subjects
        const classesToDelete = oldClasses.filter(c => !newSubjects.includes(c.subject));
        if (classesToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('classes')
            .delete()
            .in('id', classesToDelete.map(c => c.id));

          if (deleteError) throw deleteError;
        }
        
        // Add new subjects
        const subjectsToAdd = newSubjects.filter(s => !oldSubjects.includes(s));
        if (subjectsToAdd.length > 0) {
          const { error: insertError } = await supabase
            .from('classes')
            .insert(subjectsToAdd.map(subject => ({
              name: newClassName,
              grade: newGrade,
              section: newSection,
              teacher_id: null,
              room_number: "TBD",
              subject: subject
            })));

          if (insertError) throw insertError;
        }
      }
      
      setIsClassEditDialogOpen(false);
      setEditingClassName(null);
      setSelectedClass(null);
      
      toast({
        title: "Class Group Updated",
        description: `Updated ${newClassName}`,
      });
    } catch (error) {
      console.error("Error updating class group:", error);
      toast({
        title: "Error",
        description: "Failed to update class group",
        variant: "destructive"
      });
    }
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
      
      <Tabs 
        defaultValue="classes" 
        className="w-full"
        onValueChange={(value) => {
          console.log('Tab changed to:', value);
          if (value === 'classes') {
            console.log('Reloading classes after tab switch...');
            loadClasses();
          }
        }}
      >
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

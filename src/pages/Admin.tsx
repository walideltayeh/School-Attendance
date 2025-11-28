
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AddBusStopForm } from "@/components/admin/AddBusStopForm";
import { AddClassForm } from "@/components/admin/AddClassForm";
import { SubjectManagement } from "@/components/admin/SubjectManagement";
import { BulkClassImport } from "@/components/admin/BulkClassImport";
import { ScheduleQRCode } from "@/components/admin/ScheduleQRCode";
import { DataCleanup } from "@/components/admin/DataCleanup";
import { RoomManagement } from "@/components/admin/RoomManagement";
import { RoomScheduleView } from "@/components/admin/RoomScheduleView";
import { RoomOccupancyCalendar } from "@/components/admin/RoomOccupancyCalendar";
import { BulkRoomImport } from "@/components/admin/BulkRoomImport";
import { BulkQRGenerator } from "@/components/admin/BulkQRGenerator";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [bulkAssignTeacherId, setBulkAssignTeacherId] = useState<string>("");
  const [busRoutes, setBusRoutes] = useState<any[]>([]);
  
  useEffect(() => {
    console.log('Admin component mounted, loading data...');
    loadTeachers();
    loadBusRoutes();
    loadSchedules();
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

    // Subscribe to real-time updates for schedules
    const schedulesChannel = supabase
      .channel('schedules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'class_schedules'
        },
        () => {
          console.log('Schedules changed, reloading...');
          loadSchedules();
        }
      )
      .subscribe();

    // Also reload when component becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, reloading data...');
        loadClasses();
        loadTeachers();
        loadSchedules();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('Admin component unmounting...');
      supabase.removeChannel(classesChannel);
      supabase.removeChannel(teachersChannel);
      supabase.removeChannel(schedulesChannel);
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
      teacher_id: cls.teacher_id,
      room: cls.room_number || 'TBD',
      subject: cls.subject
    }));

    console.log('Loaded classes from database:', transformedClasses);
    setClasses(transformedClasses);
  };

  const loadTeachers = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('id, teacher_code, subjects, full_name, email, phone')
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
      name: teacher.full_name || 'Unknown',
      email: teacher.email || '',
      phone: teacher.phone || '',
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
      // Create teacher record directly with all info
      const { data: newTeacher, error: teacherError } = await supabase
        .from('teachers')
        .insert({
          teacher_code: teacher.username,
          subjects: classAssignments.map(ca => ca.subject).filter(Boolean),
          full_name: teacher.name,
          email: teacher.email,
          phone: teacher.phone || null
        } as any)
        .select()
        .single();

      if (teacherError) {
        console.error('Error creating teacher:', teacherError);
        toast({
          title: "Error",
          description: "Failed to create teacher record",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Teacher Added",
        description: `${teacher.name} has been added successfully`,
      });
      
      // Reload teachers list to show the new teacher
      await loadTeachers();
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

  const loadBusRoutes = async () => {
    const { data, error } = await supabase
      .from('bus_routes')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error("Error loading bus routes:", error);
      return;
    }
    
    setBusRoutes(data || []);
  };

  const handleAddBusRoute = async (route: Omit<BusRoute, "id">) => {
    console.log("Adding bus route:", route);
    
    const { data, error } = await supabase
      .from('bus_routes')
      .insert([{
        name: route.name,
        driver_name: route.driver,
        driver_phone: route.phone,
        departure_time: route.departureTime,
        return_time: route.returnTime,
        route_code: `RT-${Date.now()}`,
        status: route.status || 'active'
      }])
      .select();
    
    if (error) {
      console.error("Error adding bus route:", error);
      toast({
        title: "Error",
        description: "Failed to add bus route: " + error.message,
        variant: "destructive",
      });
      return;
    }
    
    console.log("Bus route created successfully:", data);
    
    // Reload bus routes to update the summary
    await loadBusRoutes();
    
    toast({
      title: "Bus Route Added",
      description: `${route.name} has been added with ${route.driver} as the driver. Go to Student Registration to use it.`,
    });
  };

  const loadSchedules = async () => {
    const { data, error } = await supabase
      .from('class_schedules')
      .select(`
        *,
        classes(id, name, grade, section, subject, room_number, teacher_id),
        periods(id, period_number, start_time, end_time)
      `)
      .order('day', { ascending: true })
      .order('week_number', { ascending: true });

    if (error) {
      console.error('Error loading schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive",
      });
      return;
    }

    // Transform to match ClassSchedule interface
    const transformedSchedules = (data || []).map((sched: any) => {
      const classData = sched.classes;
      const periodData = sched.periods;
      const teacher = teachers.find(t => t.id === classData?.teacher_id);
      
      return {
        id: sched.id,
        teacherId: classData?.teacher_id || '',
        teacherName: teacher?.name || 'Unassigned',
        classId: sched.class_id,
        className: `${classData?.grade} - Section ${classData?.section} (${classData?.subject})`,
        roomId: classData?.room_number || '',
        roomName: classData?.room_number || 'TBD',
        day: sched.day,
        period: periodData?.period_number || 0,
        week: sched.week_number,
        qrCode: sched.qr_code
      };
    });

    console.log('Loaded schedules:', transformedSchedules);
    setSchedules(transformedSchedules);
  };

  const handleAddSchedule = async (schedule: Omit<ClassSchedule, "id">) => {
    // Get period from Supabase
    const { data: periodData, error: periodError } = await supabase
      .from('periods')
      .select('id')
      .eq('period_number', schedule.period)
      .maybeSingle();

    if (periodError || !periodData) {
      toast({
        title: "Error",
        description: "Please configure class periods first",
        variant: "destructive",
      });
      return;
    }

    // Update the class with selected teacher and room
    const { error: classUpdateError } = await supabase
      .from('classes')
      .update({
        teacher_id: schedule.teacherId || null,
        room_number: schedule.roomName || 'TBD'
      })
      .eq('id', schedule.classId);

    if (classUpdateError) {
      console.error('Error updating class:', classUpdateError);
      toast({
        title: "Error",
        description: "Failed to update class information",
        variant: "destructive",
      });
      return;
    }

    // Create the schedule
    const { data, error } = await supabase
      .from('class_schedules')
      .insert({
        class_id: schedule.classId,
        period_id: periodData.id,
        day: schedule.day,
        week_number: schedule.week
      })
      .select();

    if (error) {
      console.error('Error adding schedule:', error);
      toast({
        title: "Error",
        description: "Failed to add schedule",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Schedule added successfully with QR code generated",
    });

    loadSchedules();
    loadClasses();
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

  const handleAddClass = async (classData: { grades: string[]; sections: string[]; subjects: string[]; roomNumber: string; teacherId?: string }) => {
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
            teacher_id: classData.teacherId || null,
            room_number: classData.roomNumber,
            subject: subject
          });
        }
      }
    }
    
    console.log("Attempting to insert classes:", classesToInsert);
    
    // Check for existing classes with the same grade-section-subject combination
    const { data: existingClasses, error: queryError } = await supabase
      .from('classes')
      .select('grade, section, subject');
    
    if (queryError) {
      console.error("Error checking for duplicates:", queryError);
      toast({
        title: "Error",
        description: "Failed to check for duplicate classes",
        variant: "destructive",
      });
      return;
    }
    
    // Filter out duplicates
    const duplicates: string[] = [];
    const uniqueClassesToInsert = classesToInsert.filter((classToInsert) => {
      const isDuplicate = existingClasses?.some(
        (existing) =>
          existing.grade === classToInsert.grade &&
          existing.section === classToInsert.section &&
          existing.subject === classToInsert.subject
      );
      
      if (isDuplicate) {
        duplicates.push(`${classToInsert.grade} - Section ${classToInsert.section} (${classToInsert.subject})`);
      }
      
      return !isDuplicate;
    });
    
    // Show warning if duplicates were found
    if (duplicates.length > 0) {
      toast({
        title: "Duplicate Classes Found",
        description: `Skipped ${duplicates.length} duplicate class${duplicates.length > 1 ? 'es' : ''}: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? '...' : ''}`,
        variant: "destructive",
      });
    }
    
    // If all classes are duplicates, return early
    if (uniqueClassesToInsert.length === 0) {
      toast({
        title: "No Classes Created",
        description: "All selected class combinations already exist",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Inserting unique classes:", uniqueClassesToInsert);
    
    const { data, error } = await supabase
      .from('classes')
      .insert(uniqueClassesToInsert)
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
    
    const successMessage = duplicates.length > 0
      ? `Created ${uniqueClassesToInsert.length} class${uniqueClassesToInsert.length > 1 ? 'es' : ''}, skipped ${duplicates.length} duplicate${duplicates.length > 1 ? 's' : ''}`
      : `Created ${uniqueClassesToInsert.length} class${uniqueClassesToInsert.length > 1 ? 'es' : ''} successfully`;
    
    toast({
      title: "Classes Created",
      description: successMessage,
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

  const handleUpdateClassGroup = async (updatedData: { grades: string[]; sections: string[]; subjects: string[]; teacherId?: string }) => {
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
              section: newSection,
              teacher_id: updatedData.teacherId || null
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
              teacher_id: updatedData.teacherId || null,
              room_number: "TBD",
              subject: subject
            })));

          if (insertError) throw insertError;
        }
      } else {
        // Only subjects changed, same grade/section
        // Update teacher for all existing classes
        const { error: teacherUpdateError } = await supabase
          .from('classes')
          .update({ teacher_id: updatedData.teacherId || null })
          .in('id', oldClasses.map(c => c.id));

        if (teacherUpdateError) throw teacherUpdateError;

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
              teacher_id: updatedData.teacherId || null,
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

  const handleBulkTeacherAssignment = async () => {
    if (selectedClassIds.length === 0) {
      toast({
        title: "No Classes Selected",
        description: "Please select at least one class",
        variant: "destructive",
      });
      return;
    }

    if (!bulkAssignTeacherId) {
      toast({
        title: "No Teacher Selected",
        description: "Please select a teacher to assign",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .update({ teacher_id: bulkAssignTeacherId })
        .in('id', selectedClassIds);

      if (error) throw error;

      toast({
        title: "Teacher Assigned",
        description: `Assigned teacher to ${selectedClassIds.length} class${selectedClassIds.length > 1 ? 'es' : ''}`,
      });

      setIsBulkAssignDialogOpen(false);
      setSelectedClassIds([]);
      setBulkAssignTeacherId("");
      await loadClasses();
    } catch (error) {
      console.error("Error assigning teacher:", error);
      toast({
        title: "Error",
        description: "Failed to assign teacher to classes",
        variant: "destructive",
      });
    }
  };

  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const toggleAllClassesInGroup = (classGroup: typeof classes) => {
    const groupIds = classGroup.map(c => c.id);
    const allSelected = groupIds.every(id => selectedClassIds.includes(id));
    
    if (allSelected) {
      setSelectedClassIds(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      setSelectedClassIds(prev => [...new Set([...prev, ...groupIds])]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="blue-outline" onClick={() => navigate("/students")}>
          Go to Students
        </Button>
        <Button variant="blue-outline" onClick={() => navigate("/teachers")}>
          Go to Teachers
        </Button>
        <Button variant="blue-outline" onClick={() => navigate("/students/register")}>
          Register Student
        </Button>
        <Button variant="blue-outline" onClick={() => navigate("/transport")}>
          Transport
        </Button>
        <Button variant="blue-outline" onClick={() => navigate("/calendar")}>
          Calendar
        </Button>
      </div>
      
      <Tabs 
        defaultValue="rooms" 
        className="w-full"
        onValueChange={(value) => {
          console.log('Tab changed to:', value);
          if (value === 'classes') {
            console.log('Reloading classes after tab switch...');
            loadClasses();
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="periods">Periods</TabsTrigger>
          <TabsTrigger value="classes">
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Classes
          </TabsTrigger>
          <TabsTrigger value="teachers">Manage Teachers</TabsTrigger>
          <TabsTrigger value="buses">Bus Routes</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rooms">
          <div className="space-y-6">
            <RoomManagement />
            <BulkRoomImport />
            <RoomOccupancyCalendar />
            <RoomScheduleView />
          </div>
        </TabsContent>
        
        <TabsContent value="periods">
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-2xl font-bold text-primary">Class Period Times</CardTitle>
              <CardDescription>
                Configure the start and end times for each class period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClassPeriodsForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="classes">
          <SubjectManagement />
          
          <div className="mt-6">
            <DataCleanup />
          </div>
          
          <Card className="mt-6">
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-2xl font-bold text-primary">Add New Class</CardTitle>
              <CardDescription>
                Create classes by selecting grade, section, and subjects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <BulkClassImport onImportComplete={loadClasses} />
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium mb-4">Or Add Single Class</h3>
                <AddClassForm onSubmit={handleAddClass} teachers={teachers} />
              </div>
            </CardContent>
          </Card>
          
          {classes.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="border-b bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-primary">Class List</CardTitle>
                    <CardDescription>
                      Manage existing classes, grades, sections, and subjects
                    </CardDescription>
                  </div>
                  <Button
                    variant="blue"
                    onClick={() => setIsBulkAssignDialogOpen(true)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Bulk Assign Teacher
                  </Button>
                </div>
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
                        <div key={className} className="border rounded-lg p-4 bg-card transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 animate-fade-in">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={classGroup.every(c => selectedClassIds.includes(c.id))}
                                onCheckedChange={() => toggleAllClassesInGroup(classGroup)}
                              />
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{className}</h3>
                                {classGroup[0].teacher_id && (() => {
                                  const teacher = teachers.find(t => t.id === classGroup[0].teacher_id);
                                  return teacher ? (
                                    <span className="text-sm text-muted-foreground">
                                      ({teacher.name})
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <Badge variant="outline">{classGroup.length} subject{classGroup.length > 1 ? 's' : ''}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="blue-ghost" 
                                size="sm" 
                                onClick={() => handleEditClassGroup(className)}
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button 
                                variant="blue-ghost" 
                                size="sm" 
                                onClick={() => handleDuplicateClassGroup(className)}
                              >
                                <Copy className="h-4 w-4 mr-1" /> Duplicate
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-2xl font-bold text-primary">Add New Teacher</CardTitle>
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
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-2xl font-bold text-primary">Teacher List</CardTitle>
                <CardDescription>
                  Edit or manage existing teachers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map(teacher => (
                    <div key={teacher.id} className="flex justify-between items-center p-4 border rounded-md transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:bg-accent/5">
                      <div>
                        <h3 className="font-medium">{teacher.name}</h3>
                        <p className="text-sm text-muted-foreground">{teacher.email} | {teacher.subjects.join(", ")}</p>
                        {teacher.username && (
                          <p className="text-xs text-muted-foreground">Username: {teacher.username}</p>
                        )}
                      </div>
                      <Button variant="blue-outline" size="sm" onClick={() => handleEditTeacher(teacher)}>
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
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-2xl font-bold text-primary">Add New Bus Route</CardTitle>
              <CardDescription>
                Configure a new bus route for student transportation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddBusRouteForm onSubmit={handleAddBusRoute} />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-2xl font-bold text-primary">Add Bus Stop</CardTitle>
              <CardDescription>
                Add stops to existing bus routes with pickup/dropoff locations and times.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddBusStopForm />
            </CardContent>
          </Card>

          {busRoutes.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-2xl font-bold text-primary">Bus Routes Summary</CardTitle>
                <CardDescription>
                  View all created bus routes and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Route Code</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Departure Time</TableHead>
                      <TableHead>Return Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {busRoutes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell>{route.route_code}</TableCell>
                        <TableCell>{route.driver_name}</TableCell>
                        <TableCell>{route.driver_phone}</TableCell>
                        <TableCell>{route.departure_time}</TableCell>
                        <TableCell>{route.return_time}</TableCell>
                        <TableCell>
                          <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                            {route.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-2xl font-bold text-primary">Class Scheduling</CardTitle>
              <CardDescription>
                Create and manage the school timetable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClassScheduleForm 
                onSubmit={handleAddSchedule} 
                teachers={teachers}
                classes={classes}
              />
            </CardContent>
          </Card>
          
          {schedules.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-2xl font-bold text-primary">Current Schedules</CardTitle>
                <CardDescription>
                  View and manage classroom assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="border rounded-md p-3 hover:shadow-md transition-all duration-300 relative hover:border-primary/50 hover:bg-accent/5">
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button 
                          variant="blue-ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => handleEditSchedule(schedule)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive hover:bg-destructive/10" 
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
        
        <TabsContent value="qrcodes">
          <div className="space-y-6">
            <BulkQRGenerator />
            
            <Card>
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-2xl font-bold text-primary">Class Schedule QR Codes</CardTitle>
                <CardDescription>
                  Print or download QR codes for class schedule scanning
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {schedules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No schedules created yet. Create schedules in the Calendar tab to generate QR codes.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedules
                      .filter(schedule => schedule.qrCode)
                      .map((schedule) => (
                        <ScheduleQRCode
                          key={schedule.id}
                          qrCode={schedule.qrCode!}
                          className={schedule.className}
                          period={`Period ${schedule.period}`}
                          day={schedule.day}
                          room={schedule.roomName}
                          teacher={schedule.teacherName}
                          weekNumber={schedule.week}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
              variant="outline" 
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
                subjects: classes.filter(c => c.name === editingClassName).map(c => c.subject),
                teacherId: selectedClass.teacher || undefined
              }}
              isEditing={true}
              teachers={teachers}
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

      <Dialog open={isBulkAssignDialogOpen} onOpenChange={setIsBulkAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Assign Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selected Classes ({selectedClassIds.length})</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-1">
                {selectedClassIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No classes selected</p>
                ) : (
                  classes
                    .filter(c => selectedClassIds.includes(c.id))
                    .map(c => (
                      <div key={c.id} className="text-sm flex items-center justify-between">
                        <span>{c.name} - {c.subject}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleClassSelection(c.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bulk-teacher">Select Teacher</Label>
              <Select value={bulkAssignTeacherId} onValueChange={setBulkAssignTeacherId}>
                <SelectTrigger id="bulk-teacher">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Remove teacher)</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsBulkAssignDialogOpen(false);
                setSelectedClassIds([]);
                setBulkAssignTeacherId("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="blue"
              onClick={handleBulkTeacherAssignment}
              disabled={selectedClassIds.length === 0}
            >
              Assign Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Button variant="blue" onClick={confirmDuplicateClassGroup}>
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

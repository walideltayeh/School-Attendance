
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { dataService } from "@/services/dataService";
import { Save, Calendar } from "lucide-react";
import { ClassSchedule } from "@/services/dataService";
import { supabase } from "@/integrations/supabase/client";

interface ClassScheduleFormProps {
  onSubmit: (schedule: any) => void;
  editingSchedule?: ClassSchedule | null;
  onCancelEdit?: () => void;
  teachers?: any[];
  classes?: any[];
}

export function ClassScheduleForm({ onSubmit, editingSchedule = null, onCancelEdit, teachers = [], classes = [] }: ClassScheduleFormProps) {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1");
  const [weekSchedule, setWeekSchedule] = useState<number[]>([1]);
  const [applyToAllWeeks, setApplyToAllWeeks] = useState(false);
  const [availablePeriods, setAvailablePeriods] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [suggestedRooms, setSuggestedRooms] = useState<string[]>([]);
  const [classEnrollmentCount, setClassEnrollmentCount] = useState<number>(0);
  
  // Show all classes when creating a schedule - any teacher can teach any class
  const availableClasses = selectedTeacher ? classes : [];
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const weeks = [1, 2, 3, 4];

  // Load periods and rooms from database
  useEffect(() => {
    loadPeriods();
    loadRooms();

    // Subscribe to real-time updates
    const periodsChannel = supabase
      .channel('periods-changes-schedule')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'periods'
        },
        () => {
          console.log('Periods changed, reloading in schedule form...');
          loadPeriods();
        }
      )
      .subscribe();

    const roomsChannel = supabase
      .channel('rooms-changes-schedule')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        () => {
          console.log('Rooms changed, reloading in schedule form...');
          loadRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(periodsChannel);
      supabase.removeChannel(roomsChannel);
    };
  }, []);

  const loadPeriods = async () => {
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .order('period_number', { ascending: true });

    if (error) {
      console.error('Error loading periods:', error);
      return;
    }

    setAvailablePeriods(data || []);
  };

  const loadRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading rooms:', error);
      return;
    }

    setAvailableRooms(data || []);
  };

  // Initialize form with editing values if provided
  useEffect(() => {
    if (editingSchedule) {
      setSelectedTeacher(editingSchedule.teacherId);
      setSelectedClass(editingSchedule.className);
      setSelectedRoom(editingSchedule.roomId);
      setSelectedDay(editingSchedule.day);
      setSelectedPeriod(String(editingSchedule.period));
      setWeekSchedule([editingSchedule.week]);
      setApplyToAllWeeks(false);
    }
  }, [editingSchedule]);

  // Load enrollment count when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadClassEnrollment();
    }
  }, [selectedClass]);

  // Generate room suggestions when all criteria are selected
  useEffect(() => {
    if (selectedClass && selectedDay && selectedPeriod && weekSchedule.length > 0) {
      generateRoomSuggestions();
    }
  }, [selectedClass, selectedDay, selectedPeriod, weekSchedule, availableRooms, classEnrollmentCount]);

  const loadClassEnrollment = async () => {
    try {
      const { count, error } = await supabase
        .from('class_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', selectedClass);

      if (error) throw error;
      setClassEnrollmentCount(count || 0);
    } catch (error) {
      console.error('Error loading enrollment:', error);
    }
  };

  const generateRoomSuggestions = async () => {
    try {
      const suggestions: string[] = [];

      // Check which rooms are available for the selected time slot
      for (const room of availableRooms) {
        let isAvailable = true;

        // Check availability for each week in the schedule
        for (const week of weekSchedule) {
          const { data: conflicts } = await supabase
            .from('class_schedules')
            .select('id')
            .eq('room_id', room.id)
            .eq('day', selectedDay as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')
            .eq('period_id', selectedPeriod)
            .eq('week_number', week);

          if (conflicts && conflicts.length > 0) {
            isAvailable = false;
            break;
          }
        }

        // If room is available and has sufficient capacity, suggest it
        if (isAvailable) {
          if (!room.capacity || room.capacity >= classEnrollmentCount) {
            suggestions.push(room.id);
          }
        }
      }

      setSuggestedRooms(suggestions);
    } catch (error) {
      console.error('Error generating room suggestions:', error);
    }
  };
  
  const handleWeekChange = (week: number) => {
    if (applyToAllWeeks) {
      setWeekSchedule([1, 2, 3, 4]);
    } else {
      setWeekSchedule(prev => 
        prev.includes(week) 
          ? prev.filter(w => w !== week) 
          : [...prev, week]
      );
    }
  };
  
  useEffect(() => {
    if (applyToAllWeeks) {
      setWeekSchedule([1, 2, 3, 4]);
    } else if (editingSchedule) {
      setWeekSchedule([editingSchedule.week]);
    } else {
      setWeekSchedule([1]);
    }
  }, [applyToAllWeeks, editingSchedule]);

  const checkForConflicts = async (schedule: any): Promise<boolean> => {
    // Check against database schedules for conflicts
    const { data: existingSchedules, error } = await supabase
      .from('class_schedules')
      .select('*, classes(name, grade, section, subject), teachers:class_id(teachers(full_name)), rooms:room_id(name)')
      .eq('day', schedule.day)
      .eq('period_id', selectedPeriod)
      .eq('week_number', schedule.week);
    
    if (error) {
      console.error('Error checking conflicts:', error);
      return false;
    }

    // Filter out the schedule we're currently editing
    const filteredSchedules = editingSchedule 
      ? existingSchedules?.filter(s => s.id !== editingSchedule.id) 
      : existingSchedules;
    
    if (!filteredSchedules || filteredSchedules.length === 0) {
      return false;
    }
    
    // Check for teacher conflicts (same teacher, same day, period, week)
    const teacherConflict = filteredSchedules.some((s: any) => 
      s.class_id === schedule.classId
    );
    
    if (teacherConflict) {
      const conflictingClass = filteredSchedules.find((s: any) => s.class_id === schedule.classId);
      toast({
        title: "Schedule Conflict",
        description: `Teacher ${schedule.teacherName} is already scheduled at this time`,
        variant: "destructive",
      });
      return true;
    }
    
    // Check for room conflicts (same room, same day, period, week)
    const roomConflict = filteredSchedules.some((s: any) => 
      s.room_id === schedule.roomId
    );
    
    if (roomConflict) {
      const conflictingSchedule = filteredSchedules.find((s: any) => s.room_id === schedule.roomId);
      const roomName = conflictingSchedule?.rooms?.name || schedule.roomName;
      const conflictingClassName = conflictingSchedule?.classes?.name || 'another class';
      toast({
        title: "Room Double-Booking Detected",
        description: `Room ${roomName} is already booked for ${conflictingClassName} at this time`,
        variant: "destructive",
      });
      return true;
    }
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeacher || !selectedClass || !selectedRoom || !selectedDay || !selectedPeriod || weekSchedule.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const teacher = teachers.find(t => t.id === selectedTeacher);
    const selectedClassObj = availableClasses.find(c => c.id === selectedClass);
    const selectedRoomObj = availableRooms.find(r => r.id === selectedRoom);
    
    if (!teacher || !selectedClassObj || !selectedRoomObj) {
      toast({
        title: "Error",
        description: "Invalid selection - please try again",
        variant: "destructive",
      });
      return;
    }
    
    const schedules = weekSchedule.map(week => ({
      teacherId: teacher.id,
      teacherName: teacher.full_name || teacher.name,
      classId: selectedClass,
      className: `${selectedClassObj.name} (${selectedClassObj.subject})`,
      roomId: selectedRoom,
      roomName: selectedRoomObj.name,
      day: selectedDay,
      period: parseInt(selectedPeriod),
      week: week
    }));
    
    // Check each schedule for conflicts
    for (const schedule of schedules) {
      const hasConflict = await checkForConflicts(schedule);
      if (hasConflict) {
        return;
      }
    }
    
    // If we have an editing schedule, clear form after submitting
    const isEditing = !!editingSchedule;
    
    schedules.forEach(schedule => {
      onSubmit(schedule);
    });
    
    if (!isEditing) {
      // Reset form
      setSelectedTeacher("");
      setSelectedClass("");
      setSelectedRoom("");
      setSelectedDay("Monday");
      setSelectedPeriod("1");
      if (!applyToAllWeeks) {
        setWeekSchedule([1]);
      }
    } else if (onCancelEdit) {
      onCancelEdit();
    }

    toast({
      title: isEditing ? "Schedule Updated" : "Schedule Created",
      description: `Schedule has been ${isEditing ? 'updated' : 'added'} for ${schedules.length} week(s)`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="teacher">Teacher</Label>
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger id="teacher">
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.full_name || teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Select 
            value={selectedClass} 
            onValueChange={setSelectedClass}
            disabled={!selectedTeacher || availableClasses.length === 0}
          >
            <SelectTrigger id="class">
              <SelectValue placeholder={!selectedTeacher ? "Select a teacher first" : "Select class"} />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map((classObj) => (
                <SelectItem key={classObj.id} value={classObj.id}>
                  {classObj.name} ({classObj.subject})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="room">Room</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={availableRooms.length === 0}>
            <SelectTrigger id="room">
              <SelectValue placeholder={availableRooms.length === 0 ? "No rooms configured" : "Select room"} />
            </SelectTrigger>
            <SelectContent>
              {availableRooms.map((room) => {
                const isSuggested = suggestedRooms.includes(room.id);
                const enrollmentFits = !room.capacity || room.capacity >= classEnrollmentCount;
                
                return (
                  <SelectItem key={room.id} value={room.id}>
                    <div className="flex items-center justify-between w-full gap-2">
                      <span>
                        {room.name}
                        {room.building && ` - ${room.building}`}
                        {room.capacity && ` (Cap: ${room.capacity})`}
                      </span>
                      {isSuggested && (
                        <Badge variant="default" className="ml-2 bg-green-500">
                          Suggested
                        </Badge>
                      )}
                      {!enrollmentFits && classEnrollmentCount > 0 && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Too Small
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {classEnrollmentCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {classEnrollmentCount} student{classEnrollmentCount !== 1 ? 's' : ''} enrolled • {suggestedRooms.length} room{suggestedRooms.length !== 1 ? 's' : ''} suggested
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="day">Day</Label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger id="day">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="period">Period</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={availablePeriods.length === 0}>
            <SelectTrigger id="period">
              <SelectValue placeholder={availablePeriods.length === 0 ? "No periods configured" : "Select period"} />
            </SelectTrigger>
            <SelectContent>
              {availablePeriods.map((period) => (
                <SelectItem key={period.period_number} value={String(period.period_number)}>
                  Period {period.period_number} ({period.start_time} - {period.end_time})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2 border rounded-md p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="applyToAll" 
            checked={applyToAllWeeks} 
            onCheckedChange={(checked) => setApplyToAllWeeks(checked === true)}
            disabled={!!editingSchedule}
          />
          <Label htmlFor="applyToAll" className="font-medium">
            Apply to all weeks (2, 3, 4 same as Week 1)
          </Label>
        </div>
        
        {!applyToAllWeeks && (
          <div className="space-y-2">
            <Label className="block mb-2">Select weeks for this schedule:</Label>
            <div className="flex flex-wrap gap-2">
              {weeks.map((week) => (
                <Button
                  key={week}
                  type="button"
                  variant={weekSchedule.includes(week) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleWeekChange(week)}
                  className={weekSchedule.includes(week) ? "bg-primary" : ""}
                  disabled={!!editingSchedule}
                >
                  Week {week}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        {editingSchedule && onCancelEdit && (
          <Button type="button" variant="outline" className="w-full" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="blue" className="w-full">
          <Save className="h-4 w-4 mr-2" /> {editingSchedule ? "Update" : "Add"} Schedule
        </Button>
      </div>
    </form>
  );
}

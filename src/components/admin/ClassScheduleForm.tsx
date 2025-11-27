
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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

  const checkForConflicts = (schedule: any): boolean => {
    const existingSchedules = dataService.getClassSchedules();
    
    // Don't check against the schedule we're currently editing
    const filteredSchedules = editingSchedule 
      ? existingSchedules.filter(s => s.id !== editingSchedule.id) 
      : existingSchedules;
    
    // Check for teacher conflicts (same teacher, same day, period, week)
    const teacherConflict = filteredSchedules.some(s => 
      s.teacherId === schedule.teacherId && 
      s.day === schedule.day && 
      s.period === schedule.period && 
      s.week === schedule.week
    );
    
    if (teacherConflict) {
      toast({
        title: "Schedule Conflict",
        description: `Teacher ${schedule.teacherName} is already scheduled at this time`,
        variant: "destructive",
      });
      return true;
    }
    
    // Check for room conflicts (same room, same day, period, week)
    const roomConflict = filteredSchedules.some(s => 
      s.roomId === schedule.roomId && 
      s.day === schedule.day && 
      s.period === schedule.period && 
      s.week === schedule.week
    );
    
    if (roomConflict) {
      toast({
        title: "Schedule Conflict",
        description: `Room ${schedule.roomName} is already scheduled at this time`,
        variant: "destructive",
      });
      return true;
    }
    
    // Check for class conflicts (class already scheduled at this time)
    const classConflict = filteredSchedules.some(s => 
      s.className === schedule.className && 
      s.day === schedule.day && 
      s.period === schedule.period && 
      s.week === schedule.week
    );
    
    if (classConflict) {
      toast({
        title: "Schedule Conflict",
        description: `Class ${schedule.className} is already scheduled at this time`,
        variant: "destructive",
      });
      return true;
    }
    
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    
    let hasConflict = false;
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
      if (checkForConflicts(schedule)) {
        hasConflict = true;
        break;
      }
    }
    
    if (hasConflict) {
      return;
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
              {availableRooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                  {room.building && ` - ${room.building}`}
                  {room.capacity && ` (Cap: ${room.capacity})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

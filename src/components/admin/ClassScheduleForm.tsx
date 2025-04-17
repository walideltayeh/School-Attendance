
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

interface ClassScheduleFormProps {
  onSubmit: (schedule: any) => void;
  editingSchedule?: ClassSchedule | null;
  onCancelEdit?: () => void;
}

export function ClassScheduleForm({ onSubmit, editingSchedule = null, onCancelEdit }: ClassScheduleFormProps) {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1");
  const [weekSchedule, setWeekSchedule] = useState<number[]>([1]);
  const [applyToAllWeeks, setApplyToAllWeeks] = useState(false);
  
  const teachers = dataService.getTeachers();
  const rooms = dataService.getRooms();
  
  const teacherClasses = selectedTeacher 
    ? teachers.find(t => t.id === selectedTeacher)?.classes.map(c => {
        const match = c.match(/(.*) \((.*)\)/);
        return match ? { name: match[1], subject: match[2] } : null;
      }).filter(Boolean) || []
    : [];
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = Array.from({ length: 10 }, (_, i) => String(i + 1));
  const weeks = [1, 2, 3, 4];

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
    const selectedClassObj = teacherClasses.find(c => c?.name === selectedClass);
    const room = rooms.find(r => r.id === selectedRoom);
    
    if (!teacher || !selectedClassObj || !room) {
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
      teacherName: teacher.name,
      classId: selectedClass,
      className: selectedClass,
      roomId: room.id,
      roomName: room.name,
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
                  {teacher.name}
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
            disabled={!selectedTeacher || teacherClasses.length === 0}
          >
            <SelectTrigger id="class">
              <SelectValue placeholder={!selectedTeacher ? "Select a teacher first" : "Select class"} />
            </SelectTrigger>
            <SelectContent>
              {teacherClasses.map((classObj, index) => (
                <SelectItem key={index} value={classObj?.name || ""}>
                  {classObj?.name} ({classObj?.subject})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="room">Room</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger id="room">
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
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
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger id="period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period} value={period}>
                  Period {period}
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
        <Button type="submit" className="w-full">
          <Save className="h-4 w-4 mr-2" /> {editingSchedule ? "Update" : "Add"} Schedule
        </Button>
      </div>
    </form>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { dataService, Teacher } from "@/services/dataService";
import { toast } from "@/hooks/use-toast";
import { ALL_GRADES, ALL_SECTIONS } from "@/utils/classHelpers";
import { supabase } from "@/integrations/supabase/client";

interface AddClassFormProps {
  onSubmit: (classData: {
    grades: string[];
    sections: string[];
    subjects: string[];
    roomNumber: string;
    teacherId?: string;
  }) => void;
  initialValues?: {
    id: string;
    name: string;
    grade: string;
    section: string;
    subjects: string[];
    teacherId?: string;
  };
  isEditing?: boolean;
  onCancel?: () => void;
  teachers?: any[];
}


export function AddClassForm({ onSubmit, initialValues, isEditing, onCancel, teachers = [] }: AddClassFormProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>(initialValues?.grade || "");
  const [selectedSection, setSelectedSection] = useState<string>(initialValues?.section || "");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialValues?.subjects || []);
  const [selectedTeacher, setSelectedTeacher] = useState<string>(initialValues?.teacherId || "none");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [roomUsage, setRoomUsage] = useState<Record<string, number>>({});

  useEffect(() => {
    loadSubjects();
    loadRooms();
    loadRoomUsage();

    // Subscribe to real-time updates for subjects
    const subjectsChannel = supabase
      .channel('subjects-changes-form')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subjects'
        },
        () => {
          loadSubjects();
        }
      )
      .subscribe();

    // Subscribe to real-time updates for rooms
    const roomsChannel = supabase
      .channel('rooms-changes-form')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        () => {
          loadRooms();
        }
      )
      .subscribe();

    // Subscribe to real-time updates for classes (to track room usage)
    const classesChannel = supabase
      .channel('classes-changes-form')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes'
        },
        () => {
          loadRoomUsage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subjectsChannel);
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(classesChannel);
    };
  }, []);

  const loadSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading subjects:', error);
      return;
    }

    const subjects = data?.map(s => s.name) || [];
    console.log("AddClassForm loaded subjects:", subjects);
    setAvailableSubjects(subjects);
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

  const loadRoomUsage = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('room_number');

    if (error) {
      console.error('Error loading room usage:', error);
      return;
    }

    // Count how many times each room is used
    const usage: Record<string, number> = {};
    data?.forEach((classData) => {
      const room = classData.room_number;
      if (room) {
        usage[room] = (usage[room] || 0) + 1;
      }
    });

    setRoomUsage(usage);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submission attempt:", {
      grade: selectedGrade,
      section: selectedSection,
      subjects: selectedSubjects,
      room: selectedRoom,
      availableSubjects,
      availableRooms
    });

    // Validation
    if (!selectedGrade || !selectedSection || selectedSubjects.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a grade, section, and at least one subject",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRoom || selectedRoom.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Please select a room",
        variant: "destructive",
      });
      return;
    }

    // Validate that subjects are not empty strings
    if (selectedSubjects.some(subject => !subject || subject.trim() === "")) {
      toast({
        title: "Validation Error",
        description: "Subject cannot be empty",
        variant: "destructive",
      });
      return;
    }

    console.log("Calling onSubmit with data");
    onSubmit({
      grades: [selectedGrade],
      sections: [selectedSection],
      subjects: selectedSubjects,
      roomNumber: selectedRoom,
      teacherId: selectedTeacher === "none" ? undefined : selectedTeacher,
    });

    if (!isEditing) {
      setSelectedGrade("");
      setSelectedSection("");
      setSelectedSubjects([]);
      setSelectedRoom("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="grade">Select Class (Grade) *</Label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger id="grade" className="bg-background">
              <SelectValue placeholder="Select a grade" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background border border-border">
              {ALL_GRADES.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="section">Select Section *</Label>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger id="section" className="bg-background">
              <SelectValue placeholder="Select a section" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background border border-border">
              {ALL_SECTIONS.map((section) => (
                <SelectItem key={section} value={section}>
                  Section {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subject">Select Subjects *</Label>
          <MultiSelect
            options={availableSubjects.map(subject => ({ value: subject, label: subject }))}
            selected={selectedSubjects}
            onChange={setSelectedSubjects}
            placeholder="Select subjects"
            className="bg-background"
          />
        </div>

        <div>
          <Label htmlFor="room">Select Room *</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger id="room" className="bg-background">
              <SelectValue placeholder={availableRooms.length === 0 ? "No rooms available - create rooms first" : "Select a room"} />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background border border-border">
              {availableRooms.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No rooms available. Please create rooms in the Rooms tab first.
                </div>
              ) : (
                availableRooms.map((room) => {
                  const usageCount = roomUsage[room.name] || 0;
                  const isAvailable = usageCount === 0;
                  
                  return (
                    <SelectItem key={room.id} value={room.name}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>
                          {room.name}
                          {room.building && ` - ${room.building}`}
                          {room.capacity && ` (Capacity: ${room.capacity})`}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isAvailable 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                        }`}>
                          {isAvailable ? 'Available' : `${usageCount} class${usageCount > 1 ? 'es' : ''}`}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacher">Teacher (Optional)</Label>
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger id="teacher" className="bg-background">
              <SelectValue placeholder="Select a teacher (optional)" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background border border-border">
              <SelectItem value="none">None</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.full_name || teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" variant="blue">
          {isEditing ? "Save Changes" : "Add Class"}
        </Button>
        {isEditing && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

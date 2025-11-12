import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dataService, Teacher } from "@/services/dataService";
import { toast } from "@/hooks/use-toast";

interface AddClassFormProps {
  onSubmit: (classData: {
    name: string;
    grade: string;
    section: string;
    subject: string;
    room: string;
    teacherId?: string;
    teacherName?: string;
  }) => void;
  initialValues?: {
    id: string;
    name: string;
    grade: string;
    section: string;
    subject: string;
    room: string;
    teacherId?: string;
    teacherName?: string;
  };
  isEditing?: boolean;
  onCancel?: () => void;
}

const GRADES = ["KG1", "KG2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const SECTIONS = ["A", "B", "C", "D", "E", "F"];
const SUBJECTS = ["Math", "Science", "English", "Arabic", "Social Studies", "Art", "Music", "PE", "Computer Science", "French", "Spanish"];

export function AddClassForm({ onSubmit, initialValues, isEditing, onCancel }: AddClassFormProps) {
  const [grade, setGrade] = useState(initialValues?.grade || "");
  const [section, setSection] = useState(initialValues?.section || "");
  const [subject, setSubject] = useState(initialValues?.subject || "");
  const [room, setRoom] = useState(initialValues?.room || "");
  const [teacherId, setTeacherId] = useState(initialValues?.teacherId || "");

  const teachers = dataService.getTeachers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!grade || !section || !subject || !room) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const className = `${grade} - Section ${section}`;
    const selectedTeacher = teachers.find(t => t.id === teacherId);

    onSubmit({
      name: className,
      grade,
      section,
      subject,
      room,
      teacherId: teacherId || undefined,
      teacherName: selectedTeacher?.name || "Unassigned",
    });

    if (!isEditing) {
      setGrade("");
      setSection("");
      setSubject("");
      setRoom("");
      setTeacherId("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="grade">Grade *</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger id="grade">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="section">Section *</Label>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger id="section">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  Section {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger id="subject">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subj) => (
                <SelectItem key={subj} value={subj}>
                  {subj}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="room">Room Number *</Label>
          <Input
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="e.g., Room 101"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="teacher">Assign Teacher (Optional)</Label>
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger id="teacher">
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.subjects.join(", ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">
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

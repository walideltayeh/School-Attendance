import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dataService, Teacher } from "@/services/dataService";
import { toast } from "@/hooks/use-toast";
import { ALL_GRADES, ALL_SECTIONS } from "@/utils/classHelpers";
import { supabase } from "@/integrations/supabase/client";

interface AddClassFormProps {
  onSubmit: (classData: {
    grades: string[];
    sections: string[];
    subjects: string[];
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
  const [selectedSubject, setSelectedSubject] = useState<string>(initialValues?.subjects?.[0] || "");
  const [selectedTeacher, setSelectedTeacher] = useState<string>(initialValues?.teacherId || "none");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    loadSubjects();

    // Subscribe to real-time updates
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submission attempt:", {
      grade: selectedGrade,
      section: selectedSection,
      subject: selectedSubject,
      availableSubjects
    });

    if (!selectedGrade || !selectedSection || !selectedSubject) {
      toast({
        title: "Validation Error",
        description: "Please select a grade, section, and subject",
        variant: "destructive",
      });
      return;
    }

    console.log("Calling onSubmit with data");
    onSubmit({
      grades: [selectedGrade],
      sections: [selectedSection],
      subjects: [selectedSubject],
      teacherId: selectedTeacher === "none" ? undefined : selectedTeacher,
    });

    if (!isEditing) {
      setSelectedGrade("");
      setSelectedSection("");
      setSelectedSubject("");
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
          <Label htmlFor="subject">Select Subject *</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger id="subject" className="bg-background">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background border border-border">
              {availableSubjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
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

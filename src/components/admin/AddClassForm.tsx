import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dataService, Teacher } from "@/services/dataService";
import { toast } from "@/hooks/use-toast";
import { getAvailableSubjects } from "./SubjectManagement";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AddClassFormProps {
  onSubmit: (classData: {
    name: string;
    grade: string;
    section: string;
    subjects: string[];
  }) => void;
  initialValues?: {
    id: string;
    name: string;
    grade: string;
    section: string;
    subjects: string[];
  };
  isEditing?: boolean;
  onCancel?: () => void;
}

const GRADES = ["KG1", "KG2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const SECTIONS = ["A", "B", "C", "D", "E", "F"];

export function AddClassForm({ onSubmit, initialValues, isEditing, onCancel }: AddClassFormProps) {
  const [grade, setGrade] = useState(initialValues?.grade || "");
  const [section, setSection] = useState(initialValues?.section || "");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialValues?.subjects || []);
  const [currentSubject, setCurrentSubject] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    setAvailableSubjects(getAvailableSubjects());
  }, []);

  const handleAddSubject = () => {
    if (!currentSubject) return;
    
    if (selectedSubjects.includes(currentSubject)) {
      toast({
        title: "Subject Already Added",
        description: "This subject is already in the list",
        variant: "destructive",
      });
      return;
    }

    setSelectedSubjects([...selectedSubjects, currentSubject]);
    setCurrentSubject("");
  };

  const handleRemoveSubject = (subject: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!grade || !section || selectedSubjects.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select grade, section, and at least one subject",
        variant: "destructive",
      });
      return;
    }

    const className = `${grade} - Section ${section}`;

    onSubmit({
      name: className,
      grade,
      section,
      subjects: selectedSubjects,
    });

    if (!isEditing) {
      setGrade("");
      setSection("");
      setSelectedSubjects([]);
      setCurrentSubject("");
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="subject">Subjects *</Label>
          <div className="flex gap-2">
            <Select value={currentSubject} onValueChange={setCurrentSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subjects to add" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects
                  .filter(subj => !selectedSubjects.includes(subj))
                  .map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={handleAddSubject} disabled={!currentSubject}>
              Add
            </Button>
          </div>
          
          {selectedSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSubjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="text-sm py-2 px-3">
                  {subject}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subject)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
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

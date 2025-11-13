import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dataService, Teacher } from "@/services/dataService";
import { toast } from "@/hooks/use-toast";
import { getAvailableSubjects } from "./SubjectManagement";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ALL_GRADES, ALL_SECTIONS } from "@/utils/classHelpers";

interface AddClassFormProps {
  onSubmit: (classData: {
    grades: string[];
    sections: string[];
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


export function AddClassForm({ onSubmit, initialValues, isEditing, onCancel }: AddClassFormProps) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>(initialValues?.grade ? [initialValues.grade] : []);
  const [selectedSections, setSelectedSections] = useState<string[]>(initialValues?.section ? [initialValues.section] : []);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialValues?.subjects || []);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    setAvailableSubjects(getAvailableSubjects());
  }, []);

  const handleGradeToggle = (grade: string) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const handleSectionToggle = (section: string) => {
    if (selectedSections.includes(section)) {
      setSelectedSections(selectedSections.filter(s => s !== section));
    } else {
      setSelectedSections([...selectedSections, section]);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedGrades.length === 0 || selectedSections.length === 0 || selectedSubjects.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one grade, section, and subject",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      grades: selectedGrades,
      sections: selectedSections,
      subjects: selectedSubjects,
    });

    if (!isEditing) {
      setSelectedGrades([]);
      setSelectedSections([]);
      setSelectedSubjects([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Grades * (Select multiple)</Label>
          <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
            {ALL_GRADES.map((grade) => (
              <div key={grade} className="flex items-center space-x-2">
                <Checkbox
                  id={`grade-${grade}`}
                  checked={selectedGrades.includes(grade)}
                  onCheckedChange={() => handleGradeToggle(grade)}
                />
                <label
                  htmlFor={`grade-${grade}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {grade}
                </label>
              </div>
            ))}
          </div>
          {selectedGrades.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedGrades.map((grade) => (
                <Badge key={grade} variant="secondary" className="text-xs">
                  {grade}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Sections * (Select multiple)</Label>
          <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
            {ALL_SECTIONS.map((section) => (
              <div key={section} className="flex items-center space-x-2">
                <Checkbox
                  id={`section-${section}`}
                  checked={selectedSections.includes(section)}
                  onCheckedChange={() => handleSectionToggle(section)}
                />
                <label
                  htmlFor={`section-${section}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Section {section}
                </label>
              </div>
            ))}
          </div>
          {selectedSections.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedSections.map((section) => (
                <Badge key={section} variant="secondary" className="text-xs">
                  Section {section}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Subjects * (Select multiple)</Label>
          <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
            {availableSubjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={`subject-${subject}`}
                  checked={selectedSubjects.includes(subject)}
                  onCheckedChange={() => handleSubjectToggle(subject)}
                />
                <label
                  htmlFor={`subject-${subject}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {subject}
                </label>
              </div>
            ))}
          </div>
          {selectedSubjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedSubjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="text-xs">
                  {subject}
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

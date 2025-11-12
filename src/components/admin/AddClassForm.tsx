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

const GRADES = ["KG1", "KG2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const SECTIONS = ["A", "B", "C", "D", "E", "F"];

export function AddClassForm({ onSubmit, initialValues, isEditing, onCancel }: AddClassFormProps) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>(initialValues?.grade ? [initialValues.grade] : []);
  const [selectedSections, setSelectedSections] = useState<string[]>(initialValues?.section ? [initialValues.section] : []);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialValues?.subjects || []);
  const [currentSubject, setCurrentSubject] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [showGradeSelect, setShowGradeSelect] = useState(false);
  const [showSectionSelect, setShowSectionSelect] = useState(false);

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
      setCurrentSubject("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Grades * (Select multiple)</Label>
          <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
            {GRADES.map((grade) => (
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
            {SECTIONS.map((section) => (
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

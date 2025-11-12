import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DEFAULT_SUBJECTS = [
  "Math",
  "Science",
  "English",
  "Arabic",
  "Social Studies",
  "Art",
  "Music",
  "PE",
  "Computer Science",
  "ICT",
  "French",
  "Spanish",
  "Islamic Studies",
  "History",
  "Geography"
];

export function SubjectManagement() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    // Load subjects from localStorage or use defaults
    const stored = localStorage.getItem("school_subjects");
    if (stored) {
      setSubjects(JSON.parse(stored));
    } else {
      setSubjects(DEFAULT_SUBJECTS);
      localStorage.setItem("school_subjects", JSON.stringify(DEFAULT_SUBJECTS));
    }
  }, []);

  const handleAddSubject = () => {
    if (!newSubject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }

    if (subjects.includes(newSubject.trim())) {
      toast({
        title: "Error",
        description: "Subject already exists",
        variant: "destructive",
      });
      return;
    }

    const updatedSubjects = [...subjects, newSubject.trim()];
    setSubjects(updatedSubjects);
    localStorage.setItem("school_subjects", JSON.stringify(updatedSubjects));
    setNewSubject("");
    
    toast({
      title: "Subject Added",
      description: `${newSubject} has been added to the subject list`,
    });
  };

  const handleRemoveSubject = (subject: string) => {
    const updatedSubjects = subjects.filter(s => s !== subject);
    setSubjects(updatedSubjects);
    localStorage.setItem("school_subjects", JSON.stringify(updatedSubjects));
    
    toast({
      title: "Subject Removed",
      description: `${subject} has been removed`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Management</CardTitle>
        <CardDescription>
          Manage the list of subjects available in your school
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="newSubject">Add New Subject</Label>
          <div className="flex gap-2">
            <Input
              id="newSubject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g., Biology, Chemistry"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
            />
            <Button onClick={handleAddSubject}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        <div>
          <Label className="mb-3 block">Current Subjects ({subjects.length})</Label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Badge key={subject} variant="secondary" className="text-sm py-2 px-3">
                {subject}
                <button
                  onClick={() => handleRemoveSubject(subject)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function getAvailableSubjects(): string[] {
  const stored = localStorage.getItem("school_subjects");
  return stored ? JSON.parse(stored) : DEFAULT_SUBJECTS;
}

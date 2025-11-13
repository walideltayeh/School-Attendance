import { dataService } from "@/services/dataService";

/**
 * Gets available grades from existing classes
 */
export const getAvailableGrades = (): string[] => {
  const classes = dataService.getClasses();
  const grades = new Set(classes.map(c => c.name.split(' - ')[0]));
  return Array.from(grades).sort();
};

/**
 * Gets available sections for a specific grade from existing classes
 */
export const getAvailableSections = (grade: string): string[] => {
  const classes = dataService.getClasses();
  const sections = new Set(
    classes
      .filter(c => c.name.startsWith(grade))
      .map(c => c.name.split('Section ')[1]?.split(' ')[0])
      .filter(Boolean)
  );
  return Array.from(sections).sort();
};

/**
 * Gets available subjects for a specific grade-section combination
 */
export const getAvailableSubjects = (grade: string, section: string): string[] => {
  const classes = dataService.getClasses();
  const className = `${grade} - Section ${section}`;
  return classes
    .filter(c => c.name === className)
    .map(c => c.subject);
};

/**
 * All possible grades for creating new classes
 */
export const ALL_GRADES = [
  "KG1", "KG2", 
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", 
  "Grade 5", "Grade 6", "Grade 7", "Grade 8", 
  "Grade 9", "Grade 10", "Grade 11", "Grade 12"
];

/**
 * All possible sections for creating new classes
 */
export const ALL_SECTIONS = ["A", "B", "C", "D", "E", "F"];

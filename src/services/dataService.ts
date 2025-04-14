
// This service will handle all data operations in a central location
// It can be expanded to connect to a real backend API

// Types for our data models
export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  teacher: string;
  bloodType: string;
  allergies: boolean;
  status: "active" | "inactive";
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  teacher: string;
  room: string;
}

export interface BusRoute {
  id: string;
  name: string;
  driver: string;
}

export interface ScanRecord {
  id: string;
  name: string;
  time: Date;
  success: boolean;
  message?: string;
}

// Mock data storage
const STUDENTS: Student[] = [
  { 
    id: "ST001", 
    name: "Emma Thompson", 
    grade: "Grade 5", 
    section: "A", 
    teacher: "Ms. Johnson",
    bloodType: "A+",
    allergies: true,
    status: "active"
  },
  { 
    id: "ST002", 
    name: "Noah Martinez", 
    grade: "Grade 5", 
    section: "B", 
    teacher: "Mr. Davis",
    bloodType: "O-",
    allergies: false,
    status: "active"
  },
  { 
    id: "ST003", 
    name: "Olivia Wilson", 
    grade: "Grade 6", 
    section: "A", 
    teacher: "Ms. Adams",
    bloodType: "B+",
    allergies: true,
    status: "active"
  },
  { 
    id: "ST004", 
    name: "Liam Anderson", 
    grade: "Grade 6", 
    section: "B", 
    teacher: "Mr. Taylor",
    bloodType: "AB-",
    allergies: false,
    status: "inactive"
  },
  { 
    id: "ST005", 
    name: "Ava Garcia", 
    grade: "Grade 7", 
    section: "A", 
    teacher: "Ms. Williams",
    bloodType: "O+",
    allergies: true,
    status: "active"
  },
  { 
    id: "ST006", 
    name: "William Brown", 
    grade: "Grade 7", 
    section: "B", 
    teacher: "Mr. Jones",
    bloodType: "A-",
    allergies: false,
    status: "active"
  },
  { 
    id: "ST007", 
    name: "Sophia Miller", 
    grade: "Grade 8", 
    section: "A", 
    teacher: "Ms. Lewis",
    bloodType: "B-",
    allergies: true,
    status: "active"
  },
  { 
    id: "ST008", 
    name: "James Johnson", 
    grade: "Grade 8", 
    section: "B", 
    teacher: "Mr. Clark",
    bloodType: "AB+",
    allergies: false,
    status: "inactive"
  },
];

const CLASSES: ClassInfo[] = [
  { id: "class_5a", name: "Grade 5 - Section A", teacher: "Ms. Johnson", room: "103" },
  { id: "class_5b", name: "Grade 5 - Section B", teacher: "Mr. Davis", room: "104" },
  { id: "class_6a", name: "Grade 6 - Section A", teacher: "Ms. Adams", room: "201" },
  { id: "class_6b", name: "Grade 6 - Section B", teacher: "Mr. Taylor", room: "202" },
];

const BUS_ROUTES: BusRoute[] = [
  { id: "bus_1", name: "Route #1", driver: "John Smith" },
  { id: "bus_2", name: "Route #2", driver: "Mary Johnson" },
  { id: "bus_3", name: "Route #3", driver: "Robert Lee" },
  { id: "bus_4", name: "Route #4", driver: "Patricia Clark" },
];

// Data service methods
export const dataService = {
  // Student methods
  getStudents: (): Student[] => {
    return [...STUDENTS];
  },
  
  getStudent: (id: string): Student | undefined => {
    return STUDENTS.find(student => student.id === id);
  },
  
  searchStudents: (query: string): Student[] => {
    const lowercaseQuery = query.toLowerCase();
    return STUDENTS.filter(student => 
      student.name.toLowerCase().includes(lowercaseQuery) ||
      student.id.toLowerCase().includes(lowercaseQuery) ||
      student.grade.toLowerCase().includes(lowercaseQuery) ||
      student.section.toLowerCase().includes(lowercaseQuery) ||
      student.teacher.toLowerCase().includes(lowercaseQuery)
    );
  },
  
  // Class methods
  getClasses: (): ClassInfo[] => {
    return [...CLASSES];
  },
  
  getClass: (id: string): ClassInfo | undefined => {
    return CLASSES.find(classInfo => classInfo.id === id);
  },
  
  // Bus route methods
  getBusRoutes: (): BusRoute[] => {
    return [...BUS_ROUTES];
  },
  
  getBusRoute: (id: string): BusRoute | undefined => {
    return BUS_ROUTES.find(route => route.id === id);
  },
  
  // This would be replaced with an actual API call in production
  saveSettings: async (settings: Record<string, any>): Promise<boolean> => {
    console.log("Saving settings:", settings);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
};

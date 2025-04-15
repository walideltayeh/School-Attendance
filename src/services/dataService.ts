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
  // Add properties that are used in the Teachers page
  subjects: string[];
  classes: string[];
  students: number;
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
  // Add properties that are used in the Transport page
  phone?: string;
  departureTime?: string;
  returnTime?: string;
  students?: number;
  stops?: number;
  status?: "active" | "inactive";
}

export interface ScanRecord {
  id: string;
  name: string;
  time: Date;
  success: boolean;
  message?: string;
}

// Mock data for busStops and busStudents
export const busStops = [
  { id: "stop1", name: "Main Street", time: "7:30 AM", students: 8 },
  { id: "stop2", name: "Oak Avenue", time: "7:40 AM", students: 12 },
  { id: "stop3", name: "Pine Road", time: "7:50 AM", students: 5 },
  { id: "stop4", name: "Cedar Lane", time: "8:00 AM", students: 10 }
];

export const busStudents = [
  { id: "ST001", name: "Emma Thompson", grade: "Grade 5", stop: "Main Street" },
  { id: "ST002", name: "Noah Martinez", grade: "Grade 5", stop: "Oak Avenue" },
  { id: "ST005", name: "Ava Garcia", grade: "Grade 7", stop: "Pine Road" },
  { id: "ST007", name: "Sophia Miller", grade: "Grade 8", stop: "Cedar Lane" }
];

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

const TEACHERS: Teacher[] = [
  { 
    id: "T001", 
    name: "Ms. Johnson", 
    email: "johnson@school.edu", 
    phone: "(555) 123-4567", 
    subject: "Mathematics",
    subjects: ["Mathematics", "Science"],
    classes: ["Grade 5 - Section A", "Grade 6 - Section A"],
    students: 48
  },
  { 
    id: "T002", 
    name: "Mr. Davis", 
    email: "davis@school.edu", 
    phone: "(555) 234-5678", 
    subject: "English",
    subjects: ["English", "Literature"],
    classes: ["Grade 5 - Section B", "Grade 7 - Section A"],
    students: 52
  },
  { 
    id: "T003", 
    name: "Ms. Adams", 
    email: "adams@school.edu", 
    phone: "(555) 345-6789", 
    subject: "Mathematics",
    subjects: ["Mathematics"],
    classes: ["Grade 6 - Section A"],
    students: 25
  },
  { 
    id: "T004", 
    name: "Mr. Taylor", 
    email: "taylor@school.edu", 
    phone: "(555) 456-7890", 
    subject: "English",
    subjects: ["English", "History"],
    classes: ["Grade 6 - Section B", "Grade 8 - Section A"],
    students: 50
  },
  { 
    id: "T005", 
    name: "Ms. Williams", 
    email: "williams@school.edu", 
    phone: "(555) 567-8901", 
    subject: "Mathematics",
    subjects: ["Mathematics", "Computer Science"],
    classes: ["Grade 7 - Section A", "Grade 8 - Section B"],
    students: 45
  },
  { 
    id: "T006", 
    name: "Mr. Jones", 
    email: "jones@school.edu", 
    phone: "(555) 678-9012", 
    subject: "Physical Education",
    subjects: ["Physical Education"],
    classes: ["Grade 7 - Section B"],
    students: 30
  },
];

const CLASSES: ClassInfo[] = [
  { id: "class_5a", name: "Grade 5 - Section A", teacher: "Ms. Johnson", room: "103" },
  { id: "class_5b", name: "Grade 5 - Section B", teacher: "Mr. Davis", room: "104" },
  { id: "class_6a", name: "Grade 6 - Section A", teacher: "Ms. Adams", room: "201" },
  { id: "class_6b", name: "Grade 6 - Section B", teacher: "Mr. Taylor", room: "202" },
];

const BUS_ROUTES: BusRoute[] = [
  { 
    id: "bus_1", 
    name: "Route #1", 
    driver: "John Smith",
    phone: "(555) 111-2222",
    departureTime: "7:15 AM",
    returnTime: "4:00 PM",
    students: 28,
    stops: 6,
    status: "active"
  },
  { 
    id: "bus_2", 
    name: "Route #2", 
    driver: "Mary Johnson",
    phone: "(555) 222-3333",
    departureTime: "7:20 AM",
    returnTime: "4:10 PM",
    students: 32,
    stops: 7,
    status: "active"
  },
  { 
    id: "bus_3", 
    name: "Route #3", 
    driver: "Robert Lee",
    phone: "(555) 333-4444",
    departureTime: "7:30 AM",
    returnTime: "4:15 PM",
    students: 25,
    stops: 5,
    status: "inactive"
  },
  { 
    id: "bus_4", 
    name: "Route #4", 
    driver: "Patricia Clark",
    phone: "(555) 444-5555",
    departureTime: "7:25 AM",
    returnTime: "4:05 PM",
    students: 30,
    stops: 8,
    status: "active"
  },
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

  addStudent: (student: Omit<Student, "id">): Student => {
    // Generate a new ID
    const newId = "ST" + String(STUDENTS.length + 1).padStart(3, '0');
    const newStudent = { ...student, id: newId };
    
    // Add to our "database"
    STUDENTS.push(newStudent);
    
    return newStudent;
  },
  
  // Teacher methods
  getTeachers: (): Teacher[] => {
    return [...TEACHERS];
  },
  
  getTeacher: (id: string): Teacher | undefined => {
    return TEACHERS.find(teacher => teacher.id === id);
  },

  addTeacher: (teacher: Omit<Teacher, "id">): Teacher => {
    // Generate a new ID
    const newId = "T" + String(TEACHERS.length + 1).padStart(3, '0');
    const newTeacher = { ...teacher, id: newId };
    
    // Add to our "database"
    TEACHERS.push(newTeacher);
    
    return newTeacher;
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

  addBusRoute: (route: Omit<BusRoute, "id">): BusRoute => {
    // Generate a new ID
    const newId = "bus_" + (BUS_ROUTES.length + 1);
    const newRoute = { ...route, id: newId };
    
    // Add to our "database"
    BUS_ROUTES.push(newRoute);
    
    return newRoute;
  },
  
  // This would be replaced with an actual API call in production
  saveSettings: async (settings: Record<string, any>): Promise<boolean> => {
    console.log("Saving settings:", settings);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  },
  
  // Delete all data
  deleteAllData: async (): Promise<boolean> => {
    console.log("Deleting all data");
    
    // In a real application, this would call APIs to delete data from the database
    // For our mock implementation, we'll clear the arrays
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear all mock data arrays
    STUDENTS.length = 0;
    TEACHERS.length = 0;
    CLASSES.length = 0;
    BUS_ROUTES.length = 0;
    
    return true;
  }
};

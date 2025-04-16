
// Type definitions
export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  teacher: string;
  bloodType: string;
  allergies: boolean;
  busRoute?: string;
  status: "active" | "inactive";
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  subjects: string[];
  classes: string[];
  students: number;
}

export interface ClassInfo {
  id: string;
  name: string;
  teacher: string;
  room: string;
  subject: string;
}

export interface BusRoute {
  id: string;
  name: string;
  driver: string;
  phone: string;
  departureTime: string;
  returnTime: string;
  students: number;
  stops: number;
  status: "active" | "inactive";
}

export interface BusStop {
  id: string;
  name: string;
  time: string;
  students: number;
  location: string;
}

export interface BusStudent {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  stop: string;
  status: "active" | "inactive";
}

export interface ScanRecord {
  id: string;
  name: string;
  time: Date;
  success: boolean;
  message: string;
}

// Mock data
const students: Student[] = [
  { 
    id: "STU0001", 
    name: "Alice Johnson", 
    grade: "Grade 6", 
    section: "A", 
    teacher: "David Wilson", 
    bloodType: "O+", 
    allergies: false, 
    status: "active" 
  },
  { 
    id: "STU0002", 
    name: "Bob Smith", 
    grade: "Grade 8", 
    section: "B", 
    teacher: "Sarah Parker", 
    bloodType: "A-", 
    allergies: true, 
    busRoute: "BUS0002",
    status: "active" 
  },
  { 
    id: "STU0003", 
    name: "Charlie Brown", 
    grade: "Grade 5", 
    section: "C", 
    teacher: "Michael Davis", 
    bloodType: "B+", 
    allergies: false, 
    status: "inactive" 
  }
];

const teachers: Teacher[] = [
  {
    id: "TCH0001",
    name: "David Wilson",
    email: "dwilson@school.edu",
    phone: "555-1234",
    subject: "Mathematics",
    subjects: ["Mathematics", "Physics"],
    classes: ["Grade 6 - Section A (Mathematics)", "Grade 7 - Section B (Physics)"],
    students: 45
  },
  {
    id: "TCH0002",
    name: "Sarah Parker",
    email: "sparker@school.edu",
    phone: "555-5678",
    subject: "English",
    subjects: ["English", "Literature"],
    classes: ["Grade 8 - Section B (English)", "Grade 9 - Section A (Literature)"],
    students: 38
  },
  {
    id: "TCH0003",
    name: "Michael Davis",
    email: "mdavis@school.edu",
    phone: "555-9012",
    subject: "Science",
    subjects: ["Science", "Biology"],
    classes: ["Grade 5 - Section C (Science)", "Grade 6 - Section B (Biology)"],
    students: 42
  }
];

const classes: ClassInfo[] = [
  { id: "CLS0001", name: "Grade 6 - Section A", teacher: "David Wilson", room: "Room 101", subject: "Mathematics" },
  { id: "CLS0002", name: "Grade 7 - Section B", teacher: "David Wilson", room: "Room 102", subject: "Physics" },
  { id: "CLS0003", name: "Grade 8 - Section B", teacher: "Sarah Parker", room: "Room 201", subject: "English" },
  { id: "CLS0004", name: "Grade 9 - Section A", teacher: "Sarah Parker", room: "Room 202", subject: "Literature" },
  { id: "CLS0005", name: "Grade 5 - Section C", teacher: "Michael Davis", room: "Room 301", subject: "Science" },
  { id: "CLS0006", name: "Grade 6 - Section B", teacher: "Michael Davis", room: "Room 302", subject: "Biology" }
];

const busRoutes: BusRoute[] = [
  { 
    id: "BUS0001", 
    name: "North Route", 
    driver: "John Smith", 
    phone: "555-3456", 
    departureTime: "07:30", 
    returnTime: "16:00", 
    students: 28, 
    stops: 5, 
    status: "active" 
  },
  { 
    id: "BUS0002", 
    name: "South Route", 
    driver: "Emily Johnson", 
    phone: "555-7890", 
    departureTime: "07:45", 
    returnTime: "16:15", 
    students: 32, 
    stops: 6, 
    status: "active" 
  },
  { 
    id: "BUS0003", 
    name: "East Route", 
    driver: "Robert Brown", 
    phone: "555-2345", 
    departureTime: "08:00", 
    returnTime: "16:30", 
    students: 24, 
    stops: 4, 
    status: "inactive" 
  }
];

const busStops: BusStop[] = [
  { id: "STP0001", name: "Main Street & 5th Ave", time: "07:35", students: 6, location: "Downtown" },
  { id: "STP0002", name: "Oak Road & Pine Lane", time: "07:42", students: 8, location: "Suburb North" },
  { id: "STP0003", name: "Maple Drive & Elm Street", time: "07:50", students: 5, location: "Suburb East" },
  { id: "STP0004", name: "Washington Blvd & Adams Road", time: "07:55", students: 7, location: "Suburb South" },
  { id: "STP0005", name: "Central Park Entrance", time: "08:05", students: 4, location: "City Center" }
];

const busStudents: BusStudent[] = [
  { id: "BSTU0001", studentId: "STU0001", name: "Alice Johnson", grade: "Grade 6", stop: "Main Street & 5th Ave", status: "active" },
  { id: "BSTU0002", studentId: "STU0002", name: "Bob Smith", grade: "Grade 8", stop: "Oak Road & Pine Lane", status: "active" },
  { id: "BSTU0003", studentId: "STU0003", name: "Charlie Brown", grade: "Grade 5", stop: "Maple Drive & Elm Street", status: "inactive" }
];

// Dashboard data
const attendanceData: any[] = [
  { date: "2023-04-10", present: 425, absent: 15, late: 8 },
  { date: "2023-04-11", present: 430, absent: 12, late: 6 },
  { date: "2023-04-12", present: 428, absent: 10, late: 10 },
  { date: "2023-04-13", present: 432, absent: 8, late: 8 },
  { date: "2023-04-14", present: 420, absent: 18, late: 10 }
];

const performanceData: any[] = [
  { subject: "Mathematics", average: 82 },
  { subject: "Science", average: 78 },
  { subject: "English", average: 85 },
  { subject: "History", average: 76 },
  { subject: "Art", average: 90 }
];

const recentActivities: any[] = [
  { id: 1, type: "attendance", description: "Morning attendance completed", time: "08:30 AM", user: "Admin" },
  { id: 2, type: "bus", description: "All buses departed", time: "08:15 AM", user: "Transport Manager" },
  { id: 3, type: "student", description: "New student registered", time: "Yesterday", user: "Registrar" },
  { id: 4, type: "event", description: "Science fair scheduled", time: "Yesterday", user: "Event Coordinator" }
];

const upcomingEvents: any[] = [
  { id: 1, title: "Parent-Teacher Meeting", date: "2023-04-25", time: "03:00 PM - 06:00 PM" },
  { id: 2, title: "Science Fair", date: "2023-05-10", time: "09:00 AM - 02:00 PM" },
  { id: 3, title: "Sports Day", date: "2023-05-15", time: "All Day" },
  { id: 4, title: "End of Term Exam", date: "2023-06-05", time: "09:00 AM - 12:00 PM" }
];

// Data service class
class DataService {
  // Student methods
  getStudents(): Student[] {
    return students;
  }

  searchStudents(query: string): Student[] {
    const lowercaseQuery = query.toLowerCase();
    return students.filter(student => 
      student.name.toLowerCase().includes(lowercaseQuery) ||
      student.id.toLowerCase().includes(lowercaseQuery) ||
      student.grade.toLowerCase().includes(lowercaseQuery) ||
      student.teacher.toLowerCase().includes(lowercaseQuery)
    );
  }

  addStudent(student: Omit<Student, "id">): Student {
    const id = `STU${String(students.length + 1).padStart(4, '0')}`;
    const newStudent = { ...student, id };
    students.push(newStudent);
    
    // Find matching teacher from class assignments
    // Get the first part of the class name assigned to the student (Grade X) 
    // and the section to find the full class name
    const classFullName = `${student.grade} - Section ${student.section}`;
    
    // Find all teachers who teach this class
    const matchingTeachers = teachers.filter(teacher => 
      teacher.classes.some(cls => cls.includes(classFullName))
    );
    
    // If we have matching teachers but the student's teacher isn't specified, use the first match
    if (matchingTeachers.length > 0 && (!student.teacher || student.teacher.trim() === "")) {
      newStudent.teacher = matchingTeachers[0].name;
    }
    
    // Update teacher's student count
    const teacherIndex = teachers.findIndex(t => t.name === student.teacher);
    
    if (teacherIndex !== -1) {
      teachers[teacherIndex].students += 1;
    }
    
    // Update bus route's student count if applicable
    if (student.busRoute) {
      const busRouteIndex = busRoutes.findIndex(r => r.id === student.busRoute);
      if (busRouteIndex !== -1) {
        busRoutes[busRouteIndex].students += 1;
      }
    }
    
    return newStudent;
  }

  // Teacher methods
  getTeachers(): Teacher[] {
    return teachers;
  }

  addTeacher(teacher: Omit<Teacher, "id">): Teacher {
    const id = `TCH${String(teachers.length + 1).padStart(4, '0')}`;
    const newTeacher = { ...teacher, id };
    teachers.push(newTeacher);
    return newTeacher;
  }

  // Class methods
  getClasses(): ClassInfo[] {
    return classes;
  }

  addClass(classInfo: Omit<ClassInfo, "id">): ClassInfo {
    const id = `CLS${String(classes.length + 1).padStart(4, '0')}`;
    const newClass = { ...classInfo, id };
    classes.push(newClass);
    return newClass;
  }

  // Bus methods
  getBusRoutes(): BusRoute[] {
    return busRoutes;
  }

  addBusRoute(route: Omit<BusRoute, "id">): BusRoute {
    const id = `BUS${String(busRoutes.length + 1).padStart(4, '0')}`;
    const newRoute = { ...route, id };
    busRoutes.push(newRoute);
    return newRoute;
  }

  getBusStops(): BusStop[] {
    return busStops;
  }

  getBusStudents(): BusStudent[] {
    return busStudents;
  }
  
  addBusStudent(student: Omit<BusStudent, "id">): BusStudent {
    const id = `BSTU${String(busStudents.length + 1).padStart(4, '0')}`;
    const newBusStudent = { ...student, id };
    busStudents.push(newBusStudent);
    return newBusStudent;
  }

  // Dashboard methods
  getAttendanceData() {
    return attendanceData;
  }

  getPerformanceData() {
    return performanceData;
  }

  getRecentActivities() {
    return recentActivities;
  }

  getUpcomingEvents() {
    return upcomingEvents;
  }

  // Data management
  deleteAllData() {
    // Clear all arrays
    students.length = 0;
    teachers.length = 0;
    classes.length = 0;
    busRoutes.length = 0;
    busStops.length = 0;
    busStudents.length = 0;
    // Clear dashboard data
    attendanceData.length = 0;
    performanceData.length = 0;
    recentActivities.length = 0;
    upcomingEvents.length = 0;
  }
}

// Create and export a singleton instance
export const dataService = new DataService();

// Export specific arrays for direct access if needed
export {
  busStops,
  busStudents
};

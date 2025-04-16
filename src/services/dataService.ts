
// Add or modify the addStudent function to update teacher's student count
export const addStudent = (student: Omit<Student, "id">): Student => {
  const id = `STU${String(students.length + 1).padStart(4, '0')}`;
  const newStudent = { ...student, id };
  students.push(newStudent);
  
  // Update teacher's student count
  const teacherIndex = teachers.findIndex(t => 
    t.name === student.teacher || 
    t.classes.some(c => c.includes(student.grade) && c.includes(`Section ${student.section}`))
  );
  
  if (teacherIndex !== -1) {
    teachers[teacherIndex].students += 1;
  }
  
  return newStudent;
};

// Add or modify the getBusStops and getBusStudents functions
export const getBusStops = () => {
  return busStops;
};

export const getBusStudents = () => {
  return busStudents;
};

// Make sure these are included in your exports
export {
  busStops,
  busStudents
};

// Make sure other functions like deleteAllData are correctly implemented
export const deleteAllData = () => {
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
};

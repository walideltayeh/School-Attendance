import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Bus, School, AlertCircle, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BusMap from "@/components/parent/BusMap";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Student {
  id: string;
  full_name: string;
  student_code: string;
  grade: string;
  section: string;
  photo_url: string | null;
}

interface ClassSchedule {
  id: string;
  day: string;
  class: {
    name: string;
    subject: string;
  };
  period: {
    period_number: number;
    start_time: string;
    end_time: string;
  };
  room: {
    name: string;
  } | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  type: string;
  scanned_at: string | null;
  class: {
    name: string;
    subject: string;
  } | null;
  bus_route: {
    name: string;
    route_code: string;
  } | null;
}

interface BusInfo {
  route_id: string;
  route: {
    name: string;
    route_code: string;
    driver_name: string;
    driver_phone: string;
    departure_time: string;
    return_time: string;
  };
  stop: {
    name: string;
    location: string;
    arrival_time: string;
  };
}

export default function ParentPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const guardianPhone = searchParams.get("guardian") || "+1234567890"; // Default test guardian
  
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [busInfo, setBusInfo] = useState<BusInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuardianChildren();
  }, [guardianPhone]);

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadGuardianChildren = async () => {
    try {
      setLoading(true);

      // Fetch all students associated with this guardian
      const { data: guardianRecords, error: guardianError } = await supabase
        .from('guardians')
        .select(`
          student_id,
          students:student_id (
            id,
            full_name,
            student_code,
            grade,
            section,
            photo_url
          )
        `)
        .eq('phone', guardianPhone);

      if (guardianError) throw guardianError;

      if (guardianRecords && guardianRecords.length > 0) {
        const studentsList = guardianRecords
          .map(record => record.students)
          .filter(Boolean) as Student[];
        
        setChildren(studentsList);
        
        // Select first child by default
        if (studentsList.length > 0) {
          setSelectedStudentId(studentsList[0].id);
        }
      } else {
        toast({
          title: "No Children Found",
          description: "No students are associated with this guardian account.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error loading guardian children:', error);
      toast({
        title: "Error",
        description: "Failed to load student information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (studentId: string) => {
    try {
      // Fetch student info
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData);

      // Fetch class enrollments and schedules
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('student_id', studentData.id);

      if (enrollments && enrollments.length > 0) {
        const classIds = enrollments.map(e => e.class_id);
        
        const { data: schedulesData } = await supabase
          .from('class_schedules')
          .select(`
            id,
            day,
            class:classes(name, subject),
            period:periods(period_number, start_time, end_time),
            room:rooms(name)
          `)
          .in('class_id', classIds)
          .order('day')
          .order('period(period_number)');

        if (schedulesData) {
          setSchedules(schedulesData as any);
        }
      }

      // Fetch attendance records (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select(`
          id,
          date,
          status,
          type,
          scanned_at,
          class:classes(name, subject),
          bus_route:bus_routes(name, route_code)
        `)
        .eq('student_id', studentData.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('scanned_at', { ascending: false });

      if (attendanceData) {
        setAttendance(attendanceData as any);
      }

      // Fetch bus assignment
      const { data: busAssignment } = await supabase
        .from('bus_assignments')
        .select(`
          route_id,
          route:bus_routes(name, route_code, driver_name, driver_phone, departure_time, return_time),
          stop:bus_stops(name, location, arrival_time)
        `)
        .eq('student_id', studentData.id)
        .eq('status', 'active')
        .single();

      if (busAssignment) {
        setBusInfo(busAssignment as any);
      }

    } catch (error: any) {
      console.error('Error loading student data:', error);
      toast({
        title: "Error",
        description: "Failed to load student information",
        variant: "destructive"
      });
    }
  };

  const getDaySchedules = (day: string) => {
    return schedules.filter(s => s.day === day);
  };

  const getAttendanceStats = () => {
    const classroomAttendance = attendance.filter(a => a.type === 'classroom');
    const busAttendance = attendance.filter(a => a.type === 'bus');
    
    const classroomPresent = classroomAttendance.filter(a => a.status === 'present').length;
    const busPresent = busAttendance.filter(a => a.status === 'present').length;
    
    return {
      classroomTotal: classroomAttendance.length,
      classroomPresent,
      classroomRate: classroomAttendance.length > 0 
        ? Math.round((classroomPresent / classroomAttendance.length) * 100) 
        : 0,
      busTotal: busAttendance.length,
      busPresent,
      busRate: busAttendance.length > 0 
        ? Math.round((busPresent / busAttendance.length) * 100) 
        : 0,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading parent portal...</p>
        </div>
      </div>
    );
  }

  if (!student && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              No Children Found
            </CardTitle>
            <CardDescription>
              No students are associated with guardian: {guardianPhone}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const stats = getAttendanceStats();
  const currentDay = format(new Date(), 'EEEE');
  const todaySchedule = getDaySchedules(currentDay);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Child Selector */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {student.photo_url ? (
                <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{student.full_name}</h1>
              <p className="text-muted-foreground">
                Grade {student.grade} - Section {student.section}
              </p>
              <Badge variant="outline" className="mt-1">{student.student_code}</Badge>
            </div>
          </div>
          
          {/* Child Selector */}
          {children.length > 1 && (
            <Card className="w-full md:w-auto">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Viewing Child:
                  </label>
                  <Select
                    value={selectedStudentId || undefined}
                    onValueChange={setSelectedStudentId}
                  >
                    <SelectTrigger className="w-full md:w-[280px]">
                      <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{child.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {child.student_code}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {children.length} children enrolled
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classroom Attendance</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.classroomRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.classroomPresent} of {stats.classroomTotal} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bus Attendance</CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.busRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.busPresent} of {stats.busTotal} rides
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySchedule.length}</div>
              <p className="text-xs text-muted-foreground">
                {currentDay}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bus Route</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {busInfo?.route.route_code || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {busInfo?.route.name || 'Not assigned'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="bus">Bus Info</TabsTrigger>
            <TabsTrigger value="map">Bus Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Your child's class timetable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const daySchedules = getDaySchedules(day);
                    return (
                      <div key={day} className="space-y-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {day}
                          {day === currentDay && (
                            <Badge variant="default">Today</Badge>
                          )}
                        </h3>
                        {daySchedules.length > 0 ? (
                          <div className="grid gap-2">
                            {daySchedules.map(schedule => (
                              <div
                                key={schedule.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {schedule.period.start_time} - {schedule.period.end_time}
                                  </div>
                                  <div>
                                    <p className="font-medium">{schedule.class.subject}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Period {schedule.period.period_number}
                                    </p>
                                  </div>
                                </div>
                                {schedule.room && (
                                  <Badge variant="outline">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {schedule.room.name}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground p-3 border rounded-lg">
                            No classes scheduled
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Last 30 days of attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attendance.length > 0 ? (
                    attendance.map(record => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <p className="font-medium">
                              {format(new Date(record.date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {record.type === 'classroom' 
                                ? `${record.class?.name} - ${record.class?.subject}`
                                : `Bus ${record.bus_route?.route_code}`}
                            </p>
                            {record.scanned_at && (
                              <p className="text-xs text-muted-foreground">
                                Scanned at {format(new Date(record.scanned_at), 'HH:mm')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                          {record.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No attendance records found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bus" className="space-y-4">
            {busInfo ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Bus Route Information</CardTitle>
                    <CardDescription>Details about your child's bus route</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Route Name</p>
                        <p className="font-medium">{busInfo.route.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Route Code</p>
                        <p className="font-medium">{busInfo.route.route_code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Driver Name</p>
                        <p className="font-medium">{busInfo.route.driver_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Driver Phone</p>
                        <p className="font-medium">{busInfo.route.driver_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Departure Time</p>
                        <p className="font-medium">{busInfo.route.departure_time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Return Time</p>
                        <p className="font-medium">{busInfo.route.return_time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bus Stop Information</CardTitle>
                    <CardDescription>Your child's pickup/drop-off location</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Stop Name</p>
                        <p className="font-medium">{busInfo.stop.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Arrival Time</p>
                        <p className="font-medium">{busInfo.stop.arrival_time}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{busInfo.stop.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bus assignment found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Bus Tracking</CardTitle>
                <CardDescription>
                  {busInfo 
                    ? `Track ${busInfo.route.name} in real-time`
                    : 'No bus route assigned'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {busInfo ? (
                  <BusMap routeId={busInfo.route_id} />
                ) : (
                  <div className="h-96 flex items-center justify-center border rounded-lg bg-muted/20">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No bus route to track</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

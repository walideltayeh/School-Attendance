import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { LogOut, Clock, BookOpen, MapPin } from "lucide-react";
import { QRScanner } from "@/components/attendance/QRScanner";
import { AttendanceScanner } from "@/components/attendance/AttendanceScanner";

interface ScheduleEntry {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
  day: string;
  class_name: string;
  grade: string;
  section: string;
  subject: string;
  room_name: string;
  week_number: number;
}

interface ScanRecord {
  id: string;
  name: string;
  success: boolean;
  time: Date;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  student_id?: string;
  class_id?: string;
  schedule_id?: string;
  student_name?: string;
  class_name?: string;
  grade?: string;
  section?: string;
}

export default function ClassroomLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleEntry[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleEntry | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  
  const roomId = searchParams.get("roomId");
  const teacherId = searchParams.get("teacherId");

  useEffect(() => {
    if (roomId && teacherId) {
      loadRoomAndTeacherInfo();
      loadTodaySchedule();
    }
  }, [roomId, teacherId]);

  const loadRoomAndTeacherInfo = async () => {
    try {
      // Load room info
      const { data: room } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .maybeSingle();
      
      setRoomInfo(room);

      // Load teacher info
      const { data: teacher } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", teacherId)
        .maybeSingle();
      
      setTeacherInfo(teacher);
    } catch (error) {
      console.error("Error loading info:", error);
    }
  };

  const loadTodaySchedule = async () => {
    try {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
      const todayIndex = new Date().getDay();
      const today = dayNames[todayIndex];

      // Skip if weekend
      if (today === 'Sunday' || today === 'Saturday') {
        setTodaySchedule([]);
        return;
      }

      const { data, error } = await supabase
        .from("class_schedules")
        .select(`
          id,
          day,
          week_number,
          class_id,
          period_id,
          room_id,
          classes!inner(name, grade, section, subject, teacher_id),
          periods!inner(period_number, start_time, end_time),
          rooms!inner(name)
        `)
        .eq("classes.teacher_id", teacherId)
        .eq("day", today);

      if (error) throw error;

      const scheduleEntries: ScheduleEntry[] = (data || []).map((entry: any) => ({
        id: entry.id,
        period_number: entry.periods.period_number,
        start_time: entry.periods.start_time,
        end_time: entry.periods.end_time,
        day: entry.day,
        class_name: entry.classes.name,
        grade: entry.classes.grade,
        section: entry.classes.section,
        subject: entry.classes.subject,
        room_name: entry.rooms.name,
        week_number: entry.week_number,
      }));

      scheduleEntries.sort((a, b) => a.period_number - b.period_number);
      setTodaySchedule(scheduleEntries);
    } catch (error) {
      console.error("Error loading schedule:", error);
      toast({
        title: "Error",
        description: "Failed to load today's schedule",
        variant: "destructive",
      });
    }
  };

  const handleScan = async (qrCode: string) => {
    if (!selectedSchedule) {
      toast({
        title: "No Period Selected",
        description: "Please select a period first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Call the validation function
      const { data: validationData, error: validationError } = await supabase
        .rpc("validate_student_attendance", {
          _student_qr: qrCode,
          _schedule_id: selectedSchedule.id,
          _recorded_by: teacherId,
        });

      if (validationError) throw validationError;

      const validationResult = (validationData as unknown) as ValidationResult;

      if (!validationResult.valid) {
        toast({
          title: "Validation Failed",
          description: validationResult.error || "Unknown error",
          variant: "destructive",
        });
        
        setRecentScans(prev => [{
          id: qrCode,
          name: "Unknown Student",
          success: false,
          time: new Date(),
          message: validationResult.error || "Invalid QR code",
        }, ...prev.slice(0, 9)]);
        return;
      }

      // Record attendance
      const { error: insertError } = await supabase
        .from("attendance_records")
        .insert({
          student_id: validationResult.student_id!,
          class_id: validationResult.class_id!,
          schedule_id: validationResult.schedule_id!,
          recorded_by: teacherId!,
          status: "present",
          type: "classroom",
          date: new Date().toISOString().split('T')[0],
          scanned_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      toast({
        title: "Attendance Recorded",
        description: `${validationResult.student_name} marked present`,
      });

      setRecentScans(prev => [{
        id: validationResult.student_id!,
        name: validationResult.student_name!,
        success: true,
        time: new Date(),
        message: "Checked In",
      }, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/attendance");
  };

  if (!roomId || !teacherId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Access</CardTitle>
            <CardDescription>
              This page requires valid room and teacher parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/attendance")} className="w-full">
              Go to Attendance
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Classroom Device</CardTitle>
              <CardDescription>
                {roomInfo?.name && teacherInfo?.full_name && (
                  <>Room: {roomInfo.name} | Teacher: {teacherInfo.full_name}</>
                )}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardHeader>
        </Card>

        {/* Today's Schedule */}
        {todaySchedule.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Select a period to start attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {todaySchedule.map((schedule) => (
                  <Card
                    key={schedule.id}
                    className={`cursor-pointer transition-colors ${
                      selectedSchedule?.id === schedule.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setIsScanning(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Period {schedule.period_number}</Badge>
                            <span className="font-semibold">
                              {schedule.class_name} - {schedule.subject}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {schedule.room_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Grade {schedule.grade} - {schedule.section}
                            </span>
                          </div>
                        </div>
                        {selectedSchedule?.id === schedule.id && (
                          <Badge>Selected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No classes scheduled for today
              </p>
            </CardContent>
          </Card>
        )}

        {/* QR Scanner */}
        {selectedSchedule && (
          <div className="space-y-4">
            {!isScanning ? (
              <Button
                onClick={() => setIsScanning(true)}
                size="lg"
                className="w-full"
              >
                Start Attendance for Period {selectedSchedule.period_number}
              </Button>
            ) : (
              <>
                <QRScanner onScan={handleScan} isActive={isScanning} />
                <Button
                  onClick={() => setIsScanning(false)}
                  variant="outline"
                  className="w-full"
                >
                  Stop Scanning
                </Button>
              </>
            )}
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <AttendanceScanner
            type="classroom"
            selectedItemName={selectedSchedule?.class_name || ""}
            isScanning={isScanning}
            onStartScan={() => setIsScanning(true)}
            onStopScan={() => setIsScanning(false)}
            recentScans={recentScans}
          />
        )}
      </div>
    </div>
  );
}

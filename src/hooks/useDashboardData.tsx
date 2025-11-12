
import { useState, useEffect } from "react";
import { Users, QrCode, School, Bus, BookOpen } from "lucide-react";
import { ReactNode } from "react";
import { dataService } from "@/services/dataService";
import { StatCardProps } from "@/components/dashboard/DashboardStats";

interface DashboardData {
  stats: StatCardProps[];
  attendanceData: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
  recentActivities: any[];
  attendanceOverview: {
    present: number;
    absent: number;
    late: number;
    total: number;
    presentPercent: number;
    absentPercent: number;
    trend: string;
  };
  classroomAttendance: Array<{
    grade: string;
    section: string;
    present: number;
    absent: number;
    total: number;
    percentage: number;
  }>;
  busAttendance: Array<{
    route: string;
    present: number;
    absent: number;
    total: number;
    percentage: number;
  }>;
  weekdayData: Array<{
    day: string;
    present: number;
    absent: number;
  }>;
  hourlyData: Array<{
    time: string;
    count: number;
  }>;
}

export function useDashboardData(): DashboardData {
  const [stats, setStats] = useState<StatCardProps[]>([
    {
      title: "Total Students",
      value: "0",
      icon: <Users className="h-5 w-5 text-school-primary" />,
      change: "0%",
      changeType: "neutral",
    },
    {
      title: "Today's Attendance",
      value: "0%",
      icon: <QrCode className="h-5 w-5 text-school-primary" />,
      change: "0%",
      changeType: "neutral",
    },
    {
      title: "Bus Routes",
      value: "0",
      icon: <Bus className="h-5 w-5 text-school-primary" />,
      change: "Active",
      changeType: "neutral",
    },
    {
      title: "Teachers",
      value: "0",
      icon: <BookOpen className="h-5 w-5 text-school-primary" />,
      change: "0",
      changeType: "neutral",
    },
  ]);
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    presentPercent: 0,
    absentPercent: 0,
    trend: "0%"
  });
  const [classroomAttendance, setClassroomAttendance] = useState([]);
  const [busAttendance, setBusAttendance] = useState([]);
  const [weekdayData, setWeekdayData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    // Load data from dataService
    const students = dataService.getStudents();
    const teachers = dataService.getTeachers();
    const busRoutes = dataService.getBusRoutes().filter(route => route.status === "active");
    const attendanceStats = dataService.getAttendanceData();
    const activities = dataService.getRecentActivities();
    
    // Calculate attendance percentage
    let attendancePercentage = "0%";
    if (attendanceStats.length > 0) {
      const latestDay = attendanceStats[attendanceStats.length - 1];
      const total = latestDay.present + latestDay.absent + latestDay.late;
      if (total > 0) {
        attendancePercentage = `${Math.round((latestDay.present / total) * 100)}%`;
      }
    }
    
    // Calculate attendance trend
    let attendanceTrend = "0%";
    let trendType: "positive" | "negative" | "neutral" = "neutral";
    
    if (attendanceStats.length > 1) {
      const current = attendanceStats[attendanceStats.length - 1];
      const previous = attendanceStats[attendanceStats.length - 2];
      
      const currentRate = current.present / (current.present + current.absent + current.late);
      const previousRate = previous.present / (previous.present + previous.absent + previous.late);
      
      const trendValue = ((currentRate - previousRate) * 100);
      attendanceTrend = `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(1)}%`;
      trendType = trendValue > 0 ? "positive" : trendValue < 0 ? "negative" : "neutral";
    }
    
    // Update stats with real data
    setStats([
      {
        title: "Total Students",
        value: students.length.toString(),
        icon: <Users className="h-5 w-5 text-school-primary" />,
        change: `${students.length > 0 ? '+' : ''}${students.length}`,
        changeType: students.length > 0 ? "positive" : "neutral",
      },
      {
        title: "Today's Attendance",
        value: attendancePercentage,
        icon: <QrCode className="h-5 w-5 text-school-primary" />,
        change: attendanceTrend,
        changeType: trendType,
      },
      {
        title: "Bus Routes",
        value: busRoutes.length.toString(),
        icon: <Bus className="h-5 w-5 text-school-primary" />,
        change: `${busRoutes.length} Active`,
        changeType: "neutral",
      },
      {
        title: "Teachers",
        value: teachers.length.toString(),
        icon: <BookOpen className="h-5 w-5 text-school-primary" />,
        change: `+${teachers.length}`,
        changeType: "positive",
      },
    ]);
    
    // Set activities data
    setRecentActivities(activities);
    
    // Format attendance data for chart
    const chartData = attendanceStats.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      present: day.present,
      absent: day.absent,
      late: day.late
    }));
    
    setAttendanceData(chartData);
    
    // Calculate attendance overview
    if (attendanceStats.length > 0) {
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;
      
      attendanceStats.forEach(day => {
        totalPresent += day.present;
        totalAbsent += day.absent;
        totalLate += day.late || 0;
      });
      
      const total = totalPresent + totalAbsent + totalLate;
      const presentPercent = total > 0 ? parseFloat(((totalPresent / total) * 100).toFixed(1)) : 0;
      const absentPercent = total > 0 ? parseFloat(((totalAbsent / total) * 100).toFixed(1)) : 0;
      
      let trendValue = "0%";
      if (attendanceStats.length >= 2) {
        const latest = attendanceStats[attendanceStats.length - 1];
        const previous = attendanceStats[attendanceStats.length - 2];
        
        const latestRate = latest.present / (latest.present + latest.absent + (latest.late || 0));
        const previousRate = previous.present / (previous.present + previous.absent + (previous.late || 0));
        
        trendValue = `${((latestRate - previousRate) * 100).toFixed(1)}%`;
        if (latestRate > previousRate) {
          trendValue = "+" + trendValue;
        }
      }
      
      setAttendanceOverview({
        present: totalPresent,
        absent: totalAbsent,
        late: totalLate,
        total,
        presentPercent,
        absentPercent,
        trend: trendValue
      });
    }
    
    // Generate classroom attendance data
    const classes = dataService.getClasses();
    const mockClassroomData = classes.map(cls => {
      const total = Math.floor(Math.random() * 10) + 20;
      const absent = Math.floor(Math.random() * 3);
      const present = total - absent;
      const percentage = parseFloat(((present / total) * 100).toFixed(1));
      
      return {
        grade: cls.name.split(" - ")[0],
        section: cls.name.split(" - ")[1],
        present,
        absent,
        total,
        percentage
      };
    });
    setClassroomAttendance(mockClassroomData);
    
    // Generate bus attendance data
    const busRoutes2 = dataService.getBusRoutes();
    const mockBusData = busRoutes2.map(route => {
      const total = route.students;
      const absent = Math.floor(Math.random() * 3);
      const present = total - absent;
      const percentage = parseFloat(((present / total) * 100).toFixed(1));
      
      return {
        route: route.name,
        present,
        absent,
        total,
        percentage
      };
    });
    setBusAttendance(mockBusData);
    
    // Generate weekday pattern data
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const mockWeekdayData = weekdays.map((day, index) => {
      const present = 96 - (index * 2.3);
      return {
        day,
        present: parseFloat(present.toFixed(1)),
        absent: parseFloat((100 - present).toFixed(1))
      };
    });
    setWeekdayData(mockWeekdayData);
    
    // Generate hourly check-in data
    const hours = [
      '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'
    ];
    const mockHourlyData = hours.map(time => {
      let count;
      if (time === '8:00 AM' || time === '3:00 PM') {
        count = Math.floor(Math.random() * 100) + 300;
      } else {
        count = Math.floor(Math.random() * 50) + 10;
      }
      return { time, count };
    });
    setHourlyData(mockHourlyData);
  }, []);

  return {
    stats,
    attendanceData,
    recentActivities,
    attendanceOverview,
    classroomAttendance,
    busAttendance,
    weekdayData,
    hourlyData
  };
}

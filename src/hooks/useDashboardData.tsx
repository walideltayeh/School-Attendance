
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
  }, []);

  return {
    stats,
    attendanceData,
    recentActivities
  };
}

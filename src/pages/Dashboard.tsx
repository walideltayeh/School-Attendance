
import { BarChart3, BookOpen, QrCode, School, Users, Bus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { dataService } from "@/services/dataService";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState([
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
    // Get data from services
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
    let trendType = "neutral";
    
    if (attendanceStats.length > 1) {
      const current = attendanceStats[attendanceStats.length - 1];
      const previous = attendanceStats[attendanceStats.length - 2];
      
      const currentRate = current.present / (current.present + current.absent + current.late);
      const previousRate = previous.present / (previous.present + previous.absent + previous.late);
      
      const trendValue = ((currentRate - previousRate) * 100).toFixed(1);
      attendanceTrend = `${trendValue > 0 ? '+' : ''}${trendValue}%`;
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
    
    // Set recent activities
    setRecentActivities(activities);
    
    // Format attendance data for the chart
    const chartData = attendanceStats.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      present: day.present,
      absent: day.absent,
      late: day.late
    }));
    
    setAttendanceData(chartData);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to the School Scan Connect Dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/attendance">
            <Button className="bg-school-primary hover:bg-school-secondary">
              <QrCode className="mr-2 h-4 w-4" />
              Scan Attendance
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-green-500' : 
                stat.changeType === 'negative' ? 'text-red-500' : 
                'text-zinc-500'
              }`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>
              Last 5 days attendance records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="present" name="Present" fill="#22c55e" />
                    <Bar dataKey="absent" name="Absent" fill="#ef4444" />
                    <Bar dataKey="late" name="Late" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No attendance data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest check-ins and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.user}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-48">
                  <p className="text-muted-foreground">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/students/register">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Register Student
              </Button>
            </Link>
            <Link to="/attendance">
              <Button variant="outline" className="w-full justify-start">
                <QrCode className="mr-2 h-4 w-4" />
                Take Attendance
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" className="w-full justify-start">
                <School className="mr-2 h-4 w-4" />
                School Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

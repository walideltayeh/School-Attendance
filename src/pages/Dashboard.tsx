
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect } from "react";

export default function Dashboard() {
  const { stats, attendanceData, recentActivities } = useDashboardData();

  // Log data to help debug
  useEffect(() => {
    console.log("Dashboard loaded with stats:", stats);
    console.log("Attendance data:", attendanceData);
    console.log("Recent activities:", recentActivities);
  }, [stats, attendanceData, recentActivities]);

  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      <DashboardStats stats={stats} />

      <div className="grid gap-4 md:grid-cols-2">
        <AttendanceChart data={attendanceData} />
        <RecentActivities activities={recentActivities} />
      </div>
      
      <QuickActions />
    </div>
  );
}

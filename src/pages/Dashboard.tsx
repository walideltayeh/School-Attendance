
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const { stats, attendanceData, recentActivities } = useDashboardData();

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

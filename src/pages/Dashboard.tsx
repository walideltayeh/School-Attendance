
import { BarChart3, BookOpen, QrCode, School, Users, Bus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // Demo data - in a real app, this would come from an API/database
  const stats = [
    {
      title: "Total Students",
      value: "1,249",
      icon: <Users className="h-5 w-5 text-school-primary" />,
      change: "+5.2%",
      changeType: "positive",
    },
    {
      title: "Today's Attendance",
      value: "92%",
      icon: <QrCode className="h-5 w-5 text-school-primary" />,
      change: "-0.8%",
      changeType: "negative",
    },
    {
      title: "Bus Routes",
      value: "12",
      icon: <Bus className="h-5 w-5 text-school-primary" />,
      change: "Active",
      changeType: "neutral",
    },
    {
      title: "Teachers",
      value: "74",
      icon: <BookOpen className="h-5 w-5 text-school-primary" />,
      change: "+2",
      changeType: "positive",
    },
  ];

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
          <Button className="bg-school-primary hover:bg-school-secondary">
            <QrCode className="mr-2 h-4 w-4" />
            Scan Attendance
          </Button>
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
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest student check-ins and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Student {i} checked in
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {i % 2 === 0 ? "Classroom #103" : "Bus Route #4"}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {`${i * 7}m ago`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}

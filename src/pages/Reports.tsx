
import { useState } from "react";
import { 
  Calendar, 
  Download, 
  FileDown, 
  Filter, 
  BarChart3, 
  PieChart, 
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Bus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Reports() {
  const [dateRange, setDateRange] = useState("this_week");
  
  // Mock attendance overview data
  const attendanceOverview = {
    present: 1138,
    absent: 111,
    total: 1249,
    presentPercent: 91.1,
    absentPercent: 8.9,
    trend: "+1.2%"
  };
  
  // Mock classroom attendance data (daily breakdown)
  const classroomAttendance = [
    { grade: "Grade 5", section: "A", present: 23, absent: 1, total: 24, percentage: 95.8 },
    { grade: "Grade 5", section: "B", present: 22, absent: 0, total: 22, percentage: 100 },
    { grade: "Grade 6", section: "A", present: 25, absent: 1, total: 26, percentage: 96.2 },
    { grade: "Grade 6", section: "B", present: 21, absent: 2, total: 23, percentage: 91.3 },
    { grade: "Grade 7", section: "A", present: 23, absent: 2, total: 25, percentage: 92.0 },
    { grade: "Grade 7", section: "B", present: 26, absent: 1, total: 27, percentage: 96.3 },
    { grade: "Grade 8", section: "A", present: 24, absent: 1, total: 25, percentage: 96.0 },
    { grade: "Grade 8", section: "B", present: 20, absent: 3, total: 23, percentage: 87.0 },
  ];
  
  // Mock bus attendance data
  const busAttendance = [
    { route: "Route #1", present: 26, absent: 2, total: 28, percentage: 92.9 },
    { route: "Route #2", present: 23, absent: 2, total: 25, percentage: 92.0 },
    { route: "Route #3", present: 22, absent: 0, total: 22, percentage: 100.0 },
    { route: "Route #4", present: 23, absent: 1, total: 24, percentage: 95.8 },
    { route: "Route #5", present: 28, absent: 2, total: 30, percentage: 93.3 },
  ];
  
  // Mock days of week data
  const weekdayData = {
    monday: { present: 95.2, absent: 4.8 },
    tuesday: { present: 93.1, absent: 6.9 },
    wednesday: { present: 91.8, absent: 8.2 },
    thursday: { present: 88.5, absent: 11.5 },
    friday: { present: 86.7, absent: 13.3 },
  };

  // Mock hourly data
  const hourlyData = [
    { time: "7:00 AM", count: 89 },
    { time: "8:00 AM", count: 352 },
    { time: "9:00 AM", count: 134 },
    { time: "10:00 AM", count: 35 },
    { time: "11:00 AM", count: 22 },
    { time: "12:00 PM", count: 18 },
    { time: "1:00 PM", count: 27 },
    { time: "2:00 PM", count: 15 },
    { time: "3:00 PM", count: 457 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Attendance analytics and reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-school-primary hover:bg-school-secondary">
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Attendance Overview</CardTitle>
              <Select defaultValue={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              {dateRange === "today" ? "Today's" : 
               dateRange === "yesterday" ? "Yesterday's" : 
               dateRange === "this_week" ? "This week's" : 
               dateRange === "last_week" ? "Last week's" : 
               dateRange === "this_month" ? "This month's" : "Custom"} attendance statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">Present Students</div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{attendanceOverview.present}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="text-green-600">{attendanceOverview.trend}</span>
                  <span>from previous period</span>
                </div>
                <div className="text-sm font-medium">{attendanceOverview.presentPercent}% of total</div>
              </div>
              
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">Absent Students</div>
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{attendanceOverview.absent}</div>
                <div className="text-sm text-muted-foreground">Total absences recorded</div>
                <div className="text-sm font-medium">{attendanceOverview.absentPercent}% of total</div>
              </div>
              
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">Total Enrollment</div>
                  <div className="h-8 w-8 rounded-full bg-school-light flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-school-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{attendanceOverview.total}</div>
                <div className="text-sm text-muted-foreground">Registered students</div>
                <div className="text-sm font-medium">
                  <div className="h-2 bg-gray-200 rounded-full mt-1 mb-1">
                    <div 
                      className="h-2 bg-school-primary rounded-full" 
                      style={{ width: `${attendanceOverview.presentPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Present</span>
                    <span>Absent</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Detail</CardTitle>
            <CardDescription>
              Breakdown by class and bus route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="classroom">
              <TabsList className="mb-4">
                <TabsTrigger value="classroom">Classroom Attendance</TabsTrigger>
                <TabsTrigger value="bus">Bus Attendance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="classroom" className="space-y-4">
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-5">Class</div>
                    <div className="col-span-2 text-right">Present</div>
                    <div className="col-span-2 text-right">Absent</div>
                    <div className="col-span-3 text-right">Rate</div>
                  </div>
                  
                  {classroomAttendance.map((cls, index) => (
                    <div 
                      key={`${cls.grade}-${cls.section}`} 
                      className={`grid grid-cols-12 px-4 py-3 text-sm ${
                        index !== classroomAttendance.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="col-span-5">
                        <span className="font-medium">{cls.grade} - Section {cls.section}</span>
                      </div>
                      <div className="col-span-2 text-right text-green-600 font-medium">
                        {cls.present}
                      </div>
                      <div className="col-span-2 text-right text-red-600 font-medium">
                        {cls.absent}
                      </div>
                      <div className="col-span-3 text-right">
                        <Badge className={`font-medium ${
                          cls.percentage >= 95 ? "bg-green-100 text-green-800" :
                          cls.percentage >= 90 ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {cls.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="bus" className="space-y-4">
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-5">Bus Route</div>
                    <div className="col-span-2 text-right">Present</div>
                    <div className="col-span-2 text-right">Absent</div>
                    <div className="col-span-3 text-right">Rate</div>
                  </div>
                  
                  {busAttendance.map((bus, index) => (
                    <div 
                      key={bus.route} 
                      className={`grid grid-cols-12 px-4 py-3 text-sm ${
                        index !== busAttendance.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="col-span-5">
                        <span className="font-medium">{bus.route}</span>
                      </div>
                      <div className="col-span-2 text-right text-green-600 font-medium">
                        {bus.present}
                      </div>
                      <div className="col-span-2 text-right text-red-600 font-medium">
                        {bus.absent}
                      </div>
                      <div className="col-span-3 text-right">
                        <Badge className={`font-medium ${
                          bus.percentage >= 95 ? "bg-green-100 text-green-800" :
                          bus.percentage >= 90 ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {bus.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter Results
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Analysis by day and time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-3">Attendance by Day of Week</h4>
              <div className="space-y-3">
                {Object.entries(weekdayData).map(([day, data]) => (
                  <div key={day} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{day}</span>
                      <span className="font-medium">{data.present}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          data.present >= 95 ? "bg-green-500" :
                          data.present >= 90 ? "bg-amber-500" :
                          "bg-red-500"
                        }`}
                        style={{ width: `${data.present}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-semibold mb-3">Hourly Check-in Distribution</h4>
              <div className="h-40 flex items-end justify-between gap-1">
                {hourlyData.map((item) => {
                  // Calculate percentage height (max is 100%)
                  const maxCount = Math.max(...hourlyData.map(h => h.count));
                  const heightPercent = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={item.time} className="flex flex-col items-center">
                      <div 
                        className={`w-7 rounded-t ${
                          item.time.includes("8:00 AM") || item.time.includes("3:00 PM")
                            ? "bg-school-primary"
                            : "bg-school-light"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      <div className="text-xs mt-1 text-muted-foreground">
                        {item.time.split(" ")[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 bg-school-primary rounded"></div>
                  <span>Peak Hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 bg-school-light rounded"></div>
                  <span>Regular Hours</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Generate Custom Reports</CardTitle>
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Report Settings
            </Button>
          </div>
          <CardDescription>
            Create detailed reports for specific time periods and classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select defaultValue="attendance">
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance Summary</SelectItem>
                  <SelectItem value="detail">Detailed Attendance</SelectItem>
                  <SelectItem value="absent">Absence Report</SelectItem>
                  <SelectItem value="bus">Bus Attendance</SelectItem>
                  <SelectItem value="comparison">Comparison Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            <PieChart className="mr-2 h-4 w-4" />
            Preview Report
          </Button>
          <Button className="bg-school-primary hover:bg-school-secondary">
            <FileDown className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

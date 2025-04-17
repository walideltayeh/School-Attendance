
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataService } from "@/services/dataService";
import { format } from "date-fns";
import { Clock } from "lucide-react";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("day");
  
  const schedules = dataService.getClassSchedules();
  
  // Filter schedules for the selected date if in day view
  const filteredSchedules = date 
    ? schedules.filter(schedule => {
        const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].indexOf(schedule.day);
        const selectedDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Adjust Sunday to be 6
        return view === "day" ? dayIndex === selectedDayIndex : true;
      })
    : [];
  
  // Sort by period
  const sortedSchedules = [...filteredSchedules].sort((a, b) => a.period - b.period);
  
  // Get periods data
  const periods = dataService.getPeriods();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">School Calendar</h2>
          <p className="text-muted-foreground">
            View and manage the school schedule.
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Date</CardTitle>
            <CardDescription>Select a date to view the schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-3 pointer-events-auto border rounded-md"
              disabled={(date) => date.getDay() === 0 || date.getDay() === 6} // Disable weekends
            />
            
            <div className="mt-4">
              <Tabs defaultValue="day" onValueChange={(v) => setView(v as "day" | "week" | "month")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {date ? format(date, "EEEE, MMMM d, yyyy") : "Select a date"}
            </CardTitle>
            <CardDescription>
              {view === "day" 
                ? "Daily schedule" 
                : view === "week" 
                  ? "Weekly schedule" 
                  : "Monthly schedule"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedSchedules.length > 0 ? (
              <div className="space-y-4">
                {sortedSchedules.map((schedule, index) => {
                  const periodInfo = periods.find(p => p.periodNumber === schedule.period);
                  return (
                    <div key={index} className="flex border rounded-md p-4 hover:bg-muted/50 transition-colors">
                      <div className="min-w-[80px] text-center border-r pr-3">
                        <div className="font-medium">Period {schedule.period}</div>
                        {periodInfo && (
                          <div className="text-xs text-muted-foreground">
                            {periodInfo.startTime} - {periodInfo.endTime}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="font-medium">{schedule.className}</div>
                        <div className="text-sm text-muted-foreground">
                          Teacher: {schedule.teacherName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Room: {schedule.roomName}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground self-end">
                        {schedule.day}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Clock className="w-12 h-12 mb-2 opacity-30" />
                <p>No classes scheduled for this {view}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

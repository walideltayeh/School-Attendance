
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { dataService, ClassSchedule } from "@/services/dataService";
import { LogIn, Calendar, Clock, Users, User } from "lucide-react";

export default function ClassroomLogin() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Get the room from the roomId parameter
  const room = roomId ? dataService.getRoom(roomId) : null;
  
  // Get today's schedule for this room
  const todaySchedules = roomId ? dataService.getRoomScheduleForToday(roomId) : [];
  
  // Format the current time to display
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Sort schedules by period
  const sortedSchedules = [...todaySchedules].sort((a, b) => a.period - b.period);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the teacher's credentials
      const teacher = dataService.verifyTeacherLogin(username, password);
      
      if (teacher) {
        toast({
          title: "Login successful",
          description: `Welcome, ${teacher.name}!`,
        });
        
        // Navigate to the attendance scanning page with teacher and room context
        navigate(`/attendance/scan/${roomId}/${teacher.id}`);
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                {currentDate}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto" style={{ maxHeight: "400px" }}>
              {sortedSchedules.length > 0 ? (
                <div className="space-y-4">
                  {sortedSchedules.map((schedule, index) => (
                    <div key={index} className="border rounded-md p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {schedule.period}
                          </div>
                          <div>
                            <h3 className="font-medium text-base">{schedule.className}</h3>
                            <p className="text-sm text-muted-foreground">Period {schedule.period}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                            Week {schedule.week}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-x-6 text-sm mt-2">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-primary/70" />
                          <span>{schedule.teacherName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No classes scheduled for today in this room</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Teacher Login</CardTitle>
                <CardDescription className="mt-2">
                  {room ? `${room.name} - ${currentTime}` : "Classroom Login"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" /> Login
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <p className="text-sm text-muted-foreground">
                This device is for teacher use only
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

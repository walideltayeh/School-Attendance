
import { useState } from "react";
import { 
  Bell, 
  Clock, 
  Check, 
  X,
  FileDown,
  RefreshCw,
  Settings,
  Bus,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Mock notification data
const notifications = [
  { 
    id: 1, 
    studentName: "Emma Thompson",
    studentId: "ST001",
    type: "classroom",
    location: "Grade 5 - Section A",
    time: "08:02 AM",
    timeAgo: "2 minutes ago",
    date: "Today",
    read: false
  },
  { 
    id: 2, 
    studentName: "Noah Martinez",
    studentId: "ST002",
    type: "bus",
    location: "Bus Route #2",
    time: "07:45 AM",
    timeAgo: "19 minutes ago",
    date: "Today",
    read: false
  },
  { 
    id: 3, 
    studentName: "Olivia Wilson",
    studentId: "ST003",
    type: "classroom",
    location: "Grade 6 - Section A",
    time: "08:05 AM",
    timeAgo: "35 minutes ago",
    date: "Today",
    read: true
  },
  { 
    id: 4, 
    studentName: "William Brown",
    studentId: "ST006",
    type: "bus",
    location: "Bus Route #1",
    time: "07:32 AM",
    timeAgo: "42 minutes ago",
    date: "Today",
    read: true
  },
  { 
    id: 5, 
    studentName: "Emma Thompson",
    studentId: "ST001",
    type: "classroom",
    location: "Grade 5 - Section A",
    time: "03:16 PM",
    timeAgo: "1 day ago",
    date: "Yesterday",
    read: true
  },
  { 
    id: 6, 
    studentName: "Noah Martinez",
    studentId: "ST002",
    type: "bus",
    location: "Bus Route #2",
    time: "03:42 PM",
    timeAgo: "1 day ago",
    date: "Yesterday",
    read: true
  }
];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [notificationList, setNotificationList] = useState(notifications);
  
  const filteredNotifications = activeTab === "all" 
    ? notificationList 
    : activeTab === "unread"
      ? notificationList.filter(n => !n.read)
      : notificationList.filter(n => n.type === activeTab);
  
  const markAllAsRead = () => {
    setNotificationList(notificationList.map(n => ({ ...n, read: true })));
  };
  
  const markAsRead = (id: number) => {
    setNotificationList(notificationList.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Manage parent notifications and attendance alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-school-primary hover:bg-school-secondary">
            <Settings className="mr-2 h-4 w-4" />
            Notification Settings
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Notifications</CardTitle>
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          </div>
          <CardDescription>
            Student check-in notifications and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {notificationList.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <Badge variant="secondary" className="ml-2">
                  {notificationList.filter(n => !n.read).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="classroom">
                Classroom
                <Badge variant="secondary" className="ml-2">
                  {notificationList.filter(n => n.type === "classroom").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="bus">
                Bus
                <Badge variant="secondary" className="ml-2">
                  {notificationList.filter(n => n.type === "bus").length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="font-medium text-lg mb-1">No notifications</h3>
                  <p className="text-muted-foreground">
                    You don't have any {activeTab !== "all" ? activeTab + " " : ""}notifications at the moment.
                  </p>
                </div>
              ) : (
                <>
                  {/* Group notifications by date */}
                  {Array.from(new Set(filteredNotifications.map(n => n.date))).map(date => (
                    <div key={date} className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">{date}</h3>
                      
                      {filteredNotifications
                        .filter(n => n.date === date)
                        .map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`rounded-lg border p-4 ${!notification.read ? "bg-muted/30" : ""}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                notification.type === "classroom" 
                                  ? "bg-indigo-100" 
                                  : "bg-amber-100"
                              }`}>
                                {notification.type === "classroom" ? (
                                  <User className="h-5 w-5 text-indigo-600" />
                                ) : (
                                  <Bus className="h-5 w-5 text-amber-600" />
                                )}
                              </div>
                              
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">
                                    {notification.studentName}
                                    <span className="text-muted-foreground text-sm ml-2">
                                      ({notification.studentId})
                                    </span>
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {notification.timeAgo}
                                    </span>
                                    {!notification.read && (
                                      <Badge className="h-2 w-2 rounded-full p-0 bg-school-primary" />
                                    )}
                                  </div>
                                </div>
                                
                                <p>
                                  {notification.type === "classroom" 
                                    ? `Checked in to ${notification.location} at ${notification.time}`
                                    : `Boarded ${notification.location} at ${notification.time}`
                                  }
                                </p>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                  <Clock className="h-3 w-3" />
                                  <span>{notification.time}</span>
                                  
                                  <Badge variant="outline" className={
                                    notification.type === "classroom" 
                                      ? "text-indigo-700 bg-indigo-50 ml-2" 
                                      : "text-amber-700 bg-amber-50 ml-2"
                                  }>
                                    {notification.type === "classroom" ? "Classroom" : "Bus"}
                                  </Badge>
                                </div>
                              </div>
                              
                              {!notification.read && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">Mark as read</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export Notifications
          </Button>
          <Button variant="outline" size="sm">
            View All Notifications
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-medium">Notification Types</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="classroom">Classroom Check-ins</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when students enter class
                  </p>
                </div>
                <Switch id="classroom" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="bus">Bus Check-ins</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when students board buses
                  </p>
                </div>
                <Switch id="bus" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="absent">Absence Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when students are absent
                  </p>
                </div>
                <Switch id="absent" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="late">Late Arrivals</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when students arrive late
                  </p>
                </div>
                <Switch id="late" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="events">School Events</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive school event notifications
                  </p>
                </div>
                <Switch id="events" />
              </div>
              
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="system">System Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Important system notifications
                  </p>
                </div>
                <Switch id="system" defaultChecked />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Delivery Methods</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Send notifications to registered email
                  </p>
                </div>
                <Switch id="email" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="sms">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Send text messages to registered phone
                  </p>
                </div>
                <Switch id="sms" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="app">In-App Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Show notifications in the app
                  </p>
                </div>
                <Switch id="app" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="push">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Send notifications to mobile devices
                  </p>
                </div>
                <Switch id="push" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

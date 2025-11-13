import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Save, Server, Bell, Shield, Database, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { dataService } from "@/services/dataService";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const [schoolName, setSchoolName] = useState("Valley High School");
  const [databaseUrl, setDatabaseUrl] = useState("https://school-database.example.com/api");
  const [apiKey, setApiKey] = useState("sk_test_••••••••••••••••");
  const [sendNotifications, setSendNotifications] = useState(true);
  const [enableBarcodes, setEnableBarcodes] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSaveGeneral = async () => {
    setSaveLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveLoading(false);
    
    toast({
      title: "Settings saved",
      description: "Your general settings have been updated successfully.",
    });
  };

  const handleSaveDatabase = async () => {
    setSaveLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveLoading(false);
    
    toast({
      title: "Database settings saved",
      description: "Your database configuration has been updated successfully.",
    });
  };

  const handleDeleteAllData = async () => {
    setDeleteLoading(true);
    
    try {
      console.log("Starting data deletion process from Supabase...");
      
      // Delete data from all tables in the correct order (respecting foreign key constraints)
      await supabase.from('attendance_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('class_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('class_enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('bus_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('bus_stops').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('bus_routes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('periods').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('classes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('teachers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Also clear mock data
      await dataService.deleteAllData();
      
      toast({
        title: "All data deleted",
        description: "All system data has been successfully deleted.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error deleting data:", error);
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure your school system settings and database connections
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="dangerous">Dangerous Zone</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general settings for your school system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="school-name">School Name</Label>
                <Input
                  id="school-name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-barcodes"
                  checked={enableBarcodes}
                  onCheckedChange={setEnableBarcodes}
                />
                <Label htmlFor="enable-barcodes">Enable Barcode Scanning</Label>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                onClick={handleSaveGeneral} 
                className="bg-school-primary hover:bg-school-secondary"
                disabled={saveLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveLoading ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>
                Connect your system to a central database server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="database-url">Database URL</Label>
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="database-url"
                    value={databaseUrl}
                    onChange={(e) => setDatabaseUrl(e.target.value)}
                    placeholder="https://your-database-server.com/api"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
                />
              </div>
              
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-school-primary" />
                  <div className="font-medium">Database Status</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Your database connection is active. Last synced: 5 minutes ago
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                onClick={handleSaveDatabase} 
                className="bg-school-primary hover:bg-school-secondary"
                disabled={saveLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveLoading ? "Saving..." : "Save Database Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how notifications are sent to parents and staff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="send-notifications"
                  checked={sendNotifications}
                  onCheckedChange={setSendNotifications}
                />
                <Label htmlFor="send-notifications">Enable Parent Notifications</Label>
              </div>
              
              <div className="rounded-md bg-muted p-4 mt-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-school-primary" />
                  <div className="font-medium">Notification Services</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  SMS and Email services are configured and working properly
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and data protection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-school-primary" />
                  <div className="font-medium">Data Protection</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  All student data is encrypted and protected according to relevant data protection regulations
                </div>
              </div>
              
              <Button className="mt-4 bg-school-primary hover:bg-school-secondary">
                Run Security Audit
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dangerous" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Dangerous Zone</CardTitle>
              <CardDescription>
                Actions in this section can permanently delete data and cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-destructive/10 p-4 border border-destructive">
                <div className="flex items-start gap-4">
                  <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <div className="font-medium text-destructive">Delete All Data</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      This will permanently delete all students, teachers, classes, and other data from the system.
                      This action cannot be undone.
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="mt-4">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete All Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete all data from the system including all students, 
                            teachers, classes, and other records. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAllData}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? "Deleting..." : "Yes, delete all data"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

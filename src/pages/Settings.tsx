
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Save, Server, Bell, Shield, Database } from "lucide-react";

export default function Settings() {
  const [schoolName, setSchoolName] = useState("Valley High School");
  const [databaseUrl, setDatabaseUrl] = useState("https://school-database.example.com/api");
  const [apiKey, setApiKey] = useState("sk_test_••••••••••••••••");
  const [sendNotifications, setSendNotifications] = useState(true);
  const [enableBarcodes, setEnableBarcodes] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const handleSaveGeneral = async () => {
    setSaveLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveLoading(false);
    
    toast({
      title: "Settings saved",
      description: "Your general settings have been updated successfully.",
    });
  };

  const handleSaveDatabase = async () => {
    setSaveLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveLoading(false);
    
    toast({
      title: "Database settings saved",
      description: "Your database configuration has been updated successfully.",
    });
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
      </Tabs>
    </div>
  );
}

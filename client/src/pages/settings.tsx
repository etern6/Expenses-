import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSaveSettings = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    }, 1000);
  };
  
  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and application preferences</p>
      </div>
      
      <Tabs defaultValue="account">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" defaultValue="User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="Your email" defaultValue="user@example.com" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Input id="currency" placeholder="USD" defaultValue="USD" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" placeholder="UTC" defaultValue="UTC-5 (Eastern Time)" />
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Toggle dark mode on or off</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Compact View</h3>
                  <p className="text-sm text-gray-500">Reduce spacing in the interface</p>
                </div>
                <Switch />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you want to be notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive expense summaries via email</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Budget Alerts</h3>
                  <p className="text-sm text-gray-500">Get alerts when approaching budget limits</p>
                </div>
                <Switch />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your expense data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Export Data</h3>
                <p className="text-sm text-gray-500">Download all your expense data</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    fetch('/api/expenses/export')
                      .then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.blob();
                      })
                      .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'expenses.csv';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      })
                      .catch(error => {
                        console.error('Error downloading file:', error);
                        toast({
                          title: "Download failed",
                          description: "There was an error exporting your expenses.",
                          variant: "destructive",
                        });
                      });
                  }}
                >
                  Export as CSV
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Import Data</h3>
                <p className="text-sm text-gray-500">Import expenses from a CSV file</p>
                <Button variant="outline" className="mt-2">
                  Import Data
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Export Code</h3>
                <p className="text-sm text-gray-500">Download all application code as a CSV file</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    fetch('/api/code/export')
                      .then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.blob();
                      })
                      .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'application_code.csv';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      })
                      .catch(error => {
                        console.error('Error downloading file:', error);
                        toast({
                          title: "Download failed",
                          description: "There was an error exporting the code.",
                          variant: "destructive",
                        });
                      });
                  }}
                >
                  Export Code as CSV
                </Button>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-red-600">Danger Zone</h3>
                <p className="text-sm text-gray-500">Permanently delete all your data</p>
                <Button variant="destructive" className="mt-2">
                  Delete All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { 
  Church, 
  Shield,
  Bell,
  Save} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";


// Types for settings
interface ChurchInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  pastor: string;
  founded: string;
  description: string;
}

interface SystemSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  maintenanceMode: boolean;
  sessionTimeout: string;
  maxLoginAttempts: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [churchInfo, setChurchInfo] = useState<ChurchInfo>({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    pastor: "",
    founded: "",
    description: "",
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    emailNotifications: false,
    smsNotifications: false,
    maintenanceMode: false,
    sessionTimeout: "30",
    maxLoginAttempts: "3",
  });



  // Fetch settings from database
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      if (data.success && data.settings) {
        // Map church info settings
        const churchData: ChurchInfo = {
          name: data.settings.church_name?.value || '',
          address: data.settings.church_address?.value || '',
          phone: data.settings.church_phone?.value || '',
          email: data.settings.church_email?.value || '',
          website: data.settings.church_website?.value || '',
          pastor: data.settings.church_pastor?.value || '',
          founded: data.settings.church_founded?.value || '',
          description: data.settings.church_description?.value || '',
        };
        setChurchInfo(churchData);
        
        // Map system settings
        const systemData: SystemSettings = {
          emailNotifications: data.settings.email_notifications?.value === 'true',
          smsNotifications: data.settings.sms_notifications?.value === 'true',
          maintenanceMode: data.settings.maintenance_mode?.value === 'true',
          sessionTimeout: data.settings.session_timeout?.value || '30',
          maxLoginAttempts: data.settings.max_login_attempts?.value || '3',
        };
        setSystemSettings(systemData);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveChurchInfo = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const settingsToSave = {
        church_name: { value: churchInfo.name, category: 'church', description: 'Church name' },
        church_address: { value: churchInfo.address, category: 'church', description: 'Church address' },
        church_phone: { value: churchInfo.phone, category: 'church', description: 'Church phone number' },
        church_email: { value: churchInfo.email, category: 'church', description: 'Church email address' },
        church_website: { value: churchInfo.website, category: 'church', description: 'Church website' },
        church_pastor: { value: churchInfo.pastor, category: 'church', description: 'Church pastor name' },
        church_founded: { value: churchInfo.founded, category: 'church', description: 'Church founding year' },
        church_description: { value: churchInfo.description, category: 'church', description: 'Church description' },
      };
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToSave }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save church information');
      }
      
      const data = await response.json();
      if (data.success) {
        toast.success('Church information saved successfully!', {
          description: 'All church details have been updated.',
        });
      }
    } catch (error) {
      console.error('Error saving church info:', error);
      setError('Failed to save church information');
      toast.error('Failed to save church information', {
        description: 'Please try again or contact support if the problem persists.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const settingsToSave = {
        email_notifications: { value: systemSettings.emailNotifications.toString(), category: 'system', description: 'Enable email notifications' },
        sms_notifications: { value: systemSettings.smsNotifications.toString(), category: 'system', description: 'Enable SMS notifications' },
        maintenance_mode: { value: systemSettings.maintenanceMode.toString(), category: 'system', description: 'Maintenance mode' },
        session_timeout: { value: systemSettings.sessionTimeout, category: 'system', description: 'Session timeout in minutes' },
        max_login_attempts: { value: systemSettings.maxLoginAttempts, category: 'system', description: 'Maximum login attempts' },
      };
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToSave }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save system settings');
      }
      
      const data = await response.json();
      if (data.success) {
        toast.success('System settings saved successfully!', {
          description: 'All system configurations have been updated.',
        });
      }
    } catch (error) {
      console.error('Error saving system settings:', error);
      setError('Failed to save system settings');
      toast.error('Failed to save system settings', {
        description: 'Please try again or contact support if the problem persists.',
      });
    } finally {
      setSaving(false);
    }
  };







  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage church information
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      ) : (
      <Tabs defaultValue="church" className="space-y-4">
        <TabsList>
          <TabsTrigger value="church">Church Info</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="church" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Church className="mr-2 h-5 w-5" />
                Church Information
              </CardTitle>
              <CardDescription>
                Update your church&apos;s basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="churchName">Church Name</Label>
                  <Input
                    id="churchName"
                    value={churchInfo.name}
                    onChange={(e) => setChurchInfo({...churchInfo, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pastor">Pastor</Label>
                  <Input
                    id="pastor"
                    value={churchInfo.pastor}
                    onChange={(e) => setChurchInfo({...churchInfo, pastor: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={churchInfo.address}
                  onChange={(e) => setChurchInfo({...churchInfo, address: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={churchInfo.phone}
                    onChange={(e) => setChurchInfo({...churchInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={churchInfo.email}
                    onChange={(e) => setChurchInfo({...churchInfo, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={churchInfo.website}
                    onChange={(e) => setChurchInfo({...churchInfo, website: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="founded">Founded Year</Label>
                  <Input
                    id="founded"
                    value={churchInfo.founded}
                    onChange={(e) => setChurchInfo({...churchInfo, founded: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={churchInfo.description}
                  onChange={(e) => setChurchInfo({...churchInfo, description: e.target.value})}
                  rows={3}
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={handleSaveChurchInfo} disabled={saving || loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>





        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                About this Church Management System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Church and Company Information */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Church Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src="/MKC-Logo.png"
                        alt="Meserete Kristos Church Logo"
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Tabor Meserete Kristos Church</h3>
                      <p className="text-sm text-muted-foreground">
                        This system is designed specifically for managing church operations,
                        member information, ministries, and communications.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src="/ophirt.svg"
                        alt="Ophir Technology Logo"
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Ophir Technology</h3>
                      <p className="text-sm text-muted-foreground">
                        Developed and maintained by Ophir Technology,
                        providing innovative solutions for modern church management.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* System Details */}
             

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Features</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Member Management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Ministry Organization</span>
                  </div>
                   <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Reporting & Analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Secure Data Management</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
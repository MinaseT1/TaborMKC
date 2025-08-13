"use client";

import { useState } from "react";
import { Send, Mail, MessageSquare, Phone } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { 
  Bell, 
  Plus,
  Search,

  Eye,
  Edit,
  Trash2
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Communications will be loaded from database
// Initialize empty arrays - data will come from database
const announcements: Array<Record<string, unknown>> = [];
const emailLists: Array<Record<string, unknown>> = [];
const smsCampaigns: Array<Record<string, unknown>> = [];

export default function CommunicationsPage() {
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSMSDialogOpen, setIsSMSDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "",
    priority: "",
    publishNow: true,
  });

  const [newEmail, setNewEmail] = useState({
    subject: "",
    content: "",
    recipients: "",
    scheduleDate: "",
  });

  const [newSMS, setNewSMS] = useState({
    title: "",
    message: "",
    recipients: "",
    scheduleDate: "",
  });

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesStatus = filterStatus === "All" || announcement.status === filterStatus;
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateAnnouncement = () => {
    console.log("Creating announcement:", newAnnouncement);
    setIsAnnouncementDialogOpen(false);
    setNewAnnouncement({ title: "", content: "", type: "", priority: "", publishNow: true });
  };

  const handleSendEmail = () => {
    console.log("Sending email:", newEmail);
    setIsEmailDialogOpen(false);
    setNewEmail({ subject: "", content: "", recipients: "", scheduleDate: "" });
  };

  const handleSendSMS = () => {
    console.log("Sending SMS:", newSMS);
    setIsSMSDialogOpen(false);
    setNewSMS({ title: "", message: "", recipients: "", scheduleDate: "" });
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
          <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
          <p className="text-muted-foreground">
            Manage church announcements, notifications, and communications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Announcements</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No announcements yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No subscribers yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
            <Phone className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No SMS sent yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Bell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              No engagement data
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="email">Email Lists</TabsTrigger>
          <TabsTrigger value="sms">SMS Notifications</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                  <DialogDescription>
                    Create a new announcement for the church community.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      placeholder="Announcement title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select onValueChange={(value) => setNewAnnouncement({...newAnnouncement, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>

                          <SelectItem value="Registration">Registration</SelectItem>
                          <SelectItem value="Schedule">Schedule</SelectItem>
                          <SelectItem value="Program">Program</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select onValueChange={(value) => setNewAnnouncement({...newAnnouncement, priority: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                      placeholder="Announcement content"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="publishNow"
                      checked={newAnnouncement.publishNow}
                      onCheckedChange={(checked) => setNewAnnouncement({...newAnnouncement, publishNow: checked})}
                    />
                    <Label htmlFor="publishNow">Publish immediately</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleCreateAnnouncement}>
                    {newAnnouncement.publishNow ? "Publish" : "Save Draft"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{announcement.type}</Badge>
                      <Badge 
                        variant={announcement.priority === "High" ? "destructive" : 
                                announcement.priority === "Medium" ? "default" : "secondary"}
                      >
                        {announcement.priority}
                      </Badge>
                      <Badge 
                        variant={announcement.status === "Published" ? "default" : "secondary"}
                      >
                        {announcement.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <CardDescription>
                    By {announcement.author} • {announcement.publishDate || "Not published"} • {announcement.views} views
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Email Lists</h3>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New List
              </Button>
              <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Send Email Campaign</DialogTitle>
                    <DialogDescription>
                      Send an email to selected mailing lists.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={newEmail.subject}
                        onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                        placeholder="Email subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipients">Recipients</Label>
                      <Select onValueChange={(value) => setNewEmail({...newEmail, recipients: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mailing list" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Members (450)</SelectItem>
                          <SelectItem value="youth">Youth Ministry (85)</SelectItem>
                          <SelectItem value="leaders">Ministry Leaders (25)</SelectItem>
                          <SelectItem value="volunteers">Volunteers (120)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailContent">Content</Label>
                      <Textarea
                        id="emailContent"
                        value={newEmail.content}
                        onChange={(e) => setNewEmail({...newEmail, content: e.target.value})}
                        placeholder="Email content"
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduleDate">Schedule (Optional)</Label>
                      <Input
                        id="scheduleDate"
                        type="datetime-local"
                        value={newEmail.scheduleDate}
                        onChange={(e) => setNewEmail({...newEmail, scheduleDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleSendEmail}>
                      {newEmail.scheduleDate ? "Schedule" : "Send Now"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {emailLists.map((list) => (
              <Card key={list.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{list.name}</CardTitle>
                    <Badge variant={list.status === "Active" ? "default" : "secondary"}>
                      {list.status}
                    </Badge>
                  </div>
                  <CardDescription>{list.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subscribers:</span>
                      <span className="font-medium">{list.subscribers}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last used:</span>
                      <span className="font-medium">{list.lastUsed}</span>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                      <Button variant="outline" size="sm">
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">SMS Notifications</h3>
            <Dialog open={isSMSDialogOpen} onOpenChange={setIsSMSDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Phone className="mr-2 h-4 w-4" />
                  Send SMS
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Send SMS Notification</DialogTitle>
                  <DialogDescription>
                    Send an SMS notification to church members.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="smsTitle">Campaign Title</Label>
                    <Input
                      id="smsTitle"
                      value={newSMS.title}
                      onChange={(e) => setNewSMS({...newSMS, title: e.target.value})}
                      placeholder="SMS campaign title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsRecipients">Recipients</Label>
                    <Select onValueChange={(value) => setNewSMS({...newSMS, recipients: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members (320)</SelectItem>
                        <SelectItem value="youth">Youth Ministry (65)</SelectItem>
                        <SelectItem value="leaders">Ministry Leaders (20)</SelectItem>
                        <SelectItem value="volunteers">Volunteers (95)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsMessage">Message</Label>
                    <Textarea
                      id="smsMessage"
                      value={newSMS.message}
                      onChange={(e) => setNewSMS({...newSMS, message: e.target.value})}
                      placeholder="SMS message (160 characters max)"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground">
                      {newSMS.message.length}/160 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsScheduleDate">Schedule (Optional)</Label>
                    <Input
                      id="smsScheduleDate"
                      type="datetime-local"
                      value={newSMS.scheduleDate}
                      onChange={(e) => setNewSMS({...newSMS, scheduleDate: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsSMSDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSendSMS}>
                    {newSMS.scheduleDate ? "Schedule" : "Send Now"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Delivery Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {smsCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.title}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{campaign.message}</TableCell>
                  <TableCell>{campaign.recipients}</TableCell>
                  <TableCell>
                    <Badge variant={campaign.status === "Sent" ? "default" : "secondary"}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.sentDate}</TableCell>
                  <TableCell>{campaign.deliveryRate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Management</CardTitle>
              <CardDescription>
                Create and manage church newsletters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Newsletter Builder</h3>
                <p className="mt-2 text-muted-foreground">
                  Newsletter creation and management tools will be implemented here.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Newsletter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
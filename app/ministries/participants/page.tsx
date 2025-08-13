"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Users, UserPlus, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Ministry {
  id: string;
  name: string;
  description: string | null;
  meetingDay: string | null;
  meetingTime: string | null;
  location: string | null;
  capacity: number | null;
  isActive: boolean;
  createdAt: string;
  leaderId: string | null;
  notes: string | null;
  leaders: string[];
  _count: {
    members: number;
  };
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  joinDate?: string;
  role?: string;
}

function ManageParticipantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ministryId = searchParams.get('ministryId');
  const ministryName = searchParams.get('ministryName');
  
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [ministryMembers, setMinistryMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ministryId) {
      fetchMinistryData();
    }
  }, [ministryId]);

  const fetchMinistryData = async () => {
    if (!ministryId) return;
    
    try {
      setLoading(true);
      
      // Fetch ministry details
      const ministryResponse = await fetch(`/api/ministries/${ministryId}`);
      const ministryData = await ministryResponse.json();
      
      // Fetch ministry members
      const membersResponse = await fetch(`/api/ministries/${ministryId}/members`);
      const membersData = await membersResponse.json();
      
      if (ministryData.success && membersData.success) {
        setMinistry(ministryData.ministry);
        setMinistryMembers(membersData.members);
      } else {
        setError('Failed to load ministry data');
      }
    } catch (err) {
      setError('Error loading ministry data');
      console.error('Error fetching ministry data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!ministryId) return;
    
    try {
      const response = await fetch(`/api/ministries/${ministryId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh the members list
        await fetchMinistryData();
        toast.success('Member removed successfully', {
          description: 'The member has been removed from the ministry.',
          duration: 3000,
        });
      } else {
        toast.error('Failed to remove member', {
          description: data.error || 'Please try again later.',
          duration: 5000,
        });
        console.error('Failed to remove member:', data.error);
      }
    } catch (err) {
      toast.error('Error removing member', {
        description: 'Network error. Please check your connection and try again.',
        duration: 5000,
      });
      console.error('Error removing member:', err);
    }
  };

  const filteredMembers = ministryMembers.filter(member => 
    member.firstName.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  const activeMembers = ministryMembers.filter(m => m.status === 'ACTIVE').length;

  if (loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading ministry data...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !ministry) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="text-red-500">{error || 'Ministry not found'}</p>
            <Button onClick={() => router.push('/ministries')} className="mt-4">
              Back to Ministries
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
              {/* Breadcrumb */}
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/ministries">Ministries</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Manage Participants</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              {/* Header */}
              <div className="flex items-center justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push('/ministries')}
                      className="mr-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">
                      Manage Participants - {ministry.name}
                    </h2>
                  </div>
                  <p className="text-muted-foreground">
                    View and manage members in this ministry
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{ministryMembers.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {activeMembers} active members
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeMembers}</div>
                    <p className="text-xs text-muted-foreground">
                      {((activeMembers / ministryMembers.length) * 100 || 0).toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>
                
                {ministry.capacity && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Capacity</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{ministry.capacity}</div>
                      <p className="text-xs text-muted-foreground">
                        {ministry.capacity - ministryMembers.length} spots available
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Search Bar */}
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              {/* Members Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Ministry Members</CardTitle>
                  <CardDescription>
                    All members currently participating in {ministry.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <Users className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                {ministryMembers.length === 0 ? "No members in this ministry" : "No members match your search"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              {member.firstName} {member.lastName}
                            </TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{member.phone || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={member.status === 'ACTIVE' ? "default" : "secondary"}>
                                {member.status === 'ACTIVE' ? "Active" : member.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {member.joinDate ? (
                                <span className="text-sm text-muted-foreground">
                                  {new Date(member.joinDate).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {member.role || 'Member'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={member.status !== 'ACTIVE'}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function ManageParticipantsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManageParticipantsContent />
    </Suspense>
  );
}
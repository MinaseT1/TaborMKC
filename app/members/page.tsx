"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Search, Filter, MoreHorizontal, Mail, Phone, Loader2, Eye, Edit, Trash2, X, User, Upload, Plus } from "lucide-react";
import { createImagePreview, isValidImage, getFileSizeInMB } from "@/lib/image-utils";
import { uploadImageToSupabase, ensureBucketExists } from "@/lib/storage-utils";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Member {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  subcity?: string;
  kebele?: string;
  specialPlaceName?: string;
  status: string;
  membershipType: string;
  createdAt: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  numberOfChildren?: number;
  childrenAges?: number[];
  childrenInfo?: { name: string; age: number }[];
  profession?: string;
  uniqueSkills?: string[];
  educationLevel?: string;
  profileImage?: string;
  ministryNames?: string;
  ministries?: Array<Record<string, unknown>>;
  saleGroupId?: string;
  saleGroupName?: string;
  saleGroupLeaderName?: string;
  zoneName?: string;
  zoneLeaderName?: string;
}

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Member>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [totalMinistries, setTotalMinistries] = useState(0);
  const [activeMinistries, setActiveMinistries] = useState(0);
  const router = useRouter();

  // Fetch members and ministries from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch members
        const membersResponse = await fetch('/api/members');
        const membersData = await membersResponse.json();
        
        if (membersData.success) {
          setMembers(membersData.members);
        } else {
          setError('Failed to load members');
        }
        
        // Fetch ministries
        const ministriesResponse = await fetch('/api/ministries');
        const ministriesData = await ministriesResponse.json();
        
        if (ministriesData.success) {
          const ministries = ministriesData.ministries;
          setTotalMinistries(ministries.length);
          setActiveMinistries(ministries.filter((m: Record<string, unknown>) => m.isActive).length);
        }
        
      } catch (err) {
        setError('Failed to connect to database');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddMember = () => {
    router.push('/registration');
  };

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    
    // Ensure childrenAges is always an array
    let childrenAges: number[] = [];
    if (member.childrenAges) {
      if (Array.isArray(member.childrenAges)) {
        childrenAges = member.childrenAges;
      } else if (typeof member.childrenAges === 'string') {
        try {
          childrenAges = JSON.parse(member.childrenAges);
          if (!Array.isArray(childrenAges)) {
            childrenAges = [];
          }
        } catch {
          childrenAges = [];
        }
      }
    }

    // Ensure childrenInfo is always an array
    let childrenInfo: { name: string; age: number }[] = [];
    if (member.childrenInfo) {
      if (Array.isArray(member.childrenInfo)) {
        childrenInfo = member.childrenInfo;
      } else if (typeof member.childrenInfo === 'string') {
        try {
          childrenInfo = JSON.parse(member.childrenInfo);
          if (!Array.isArray(childrenInfo)) {
            childrenInfo = [];
          }
        } catch {
          childrenInfo = [];
        }
      }
    }
    
    setEditFormData({
      firstName: member.firstName,
      middleName: member.middleName || '',
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      subcity: member.subcity || '',
      kebele: member.kebele || '',
      specialPlaceName: member.specialPlaceName || '',
      status: member.status,
      membershipType: member.membershipType,
      dateOfBirth: member.dateOfBirth || '',
      numberOfChildren: member.numberOfChildren || 0,
      childrenAges: childrenAges,
      childrenInfo: childrenInfo,
      profession: member.profession || '',
      uniqueSkills: member.uniqueSkills || [],
      educationLevel: member.educationLevel || '',
      profileImage: member.profileImage || '',
      gender: member.gender || '',
      maritalStatus: member.maritalStatus || ''
    });
    setEditImagePreview(null);
    setNewImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidImage(file)) {
      toast.error('Invalid file type', {
        description: 'Please select a valid image file (JPEG, PNG, or WebP).',
      });
      return;
    }

    try {
      const fileSizeInMB = getFileSizeInMB(file);
      
      // Check file size limit (5MB)
      if (fileSizeInMB > 5) {
        toast.error('File too large', {
          description: `Image is ${fileSizeInMB.toFixed(2)}MB. Please select an image under 5MB.`,
        });
        return;
      }
      
      // Create preview
      const previewUrl = createImagePreview(file);
      setEditImagePreview(previewUrl);
      setNewImageFile(file);
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Error processing image', {
        description: 'Failed to process the selected image. Please try again.',
      });
    }
  };

  const removeEditImage = () => {
    setEditImagePreview(null);
    setNewImageFile(null);
    setEditFormData(prev => ({ ...prev, profileImage: '' }));
  };

  const addChildAge = () => {
    const currentAges = editFormData.childrenAges || [];
    setEditFormData(prev => ({
      ...prev,
      childrenAges: [...currentAges, 0],
      numberOfChildren: currentAges.length + 1
    }));
  };

  const removeChildAge = (index: number) => {
    const currentAges = editFormData.childrenAges || [];
    const newAges = currentAges.filter((_, i) => i !== index);
    setEditFormData(prev => ({
      ...prev,
      childrenAges: newAges,
      numberOfChildren: newAges.length
    }));
  };

  const updateChildAge = (index: number, age: number) => {
    const currentAges = editFormData.childrenAges || [];
    const newAges = [...currentAges];
    newAges[index] = age;
    setEditFormData(prev => ({
      ...prev,
      childrenAges: newAges
    }));
  };

  // New functions for childrenInfo
  const addChild = () => {
    const currentChildrenInfo = editFormData.childrenInfo || [];
    setEditFormData(prev => ({
      ...prev,
      childrenInfo: [...currentChildrenInfo, { name: '', age: 0 }],
      numberOfChildren: currentChildrenInfo.length + 1
    }));
  };

  const removeChild = (index: number) => {
    const currentChildrenInfo = editFormData.childrenInfo || [];
    const newChildrenInfo = currentChildrenInfo.filter((_, i) => i !== index);
    setEditFormData(prev => ({
      ...prev,
      childrenInfo: newChildrenInfo,
      numberOfChildren: newChildrenInfo.length
    }));
  };

  const handleChildInfoChange = (index: number, field: 'name' | 'age', value: string | number) => {
    const currentChildrenInfo = editFormData.childrenInfo || [];
    const newChildrenInfo = [...currentChildrenInfo];
    newChildrenInfo[index] = {
      ...newChildrenInfo[index],
      [field]: value
    };
    setEditFormData(prev => ({
      ...prev,
      childrenInfo: newChildrenInfo
    }));
  };

  const handleDeleteMember = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/members?id=${memberToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMembers(members.filter(m => m.id !== memberToDelete.id));
        toast.success('Member deleted successfully');
      } else {
        toast.error('Failed to delete member');
      }
    } catch (error) {
      toast.error('Error deleting member');
      console.error('Error deleting member:', error);
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    try {
      let profileImageUrl = editFormData.profileImage || '';
      
      // Upload new image if one was selected
      if (newImageFile) {
        toast.info('Processing image...', {
          description: 'Please wait while we process your profile image.',
        });
        
        // Ensure Supabase bucket exists
        const bucketReady = await ensureBucketExists();
        
        if (bucketReady) {
          const uploadResult = await uploadImageToSupabase(
            newImageFile,
            'member-photos',
            'profiles'
          );
          
          if (uploadResult) {
            profileImageUrl = uploadResult.url;
            toast.success('Image uploaded successfully!');
          } else {
            toast.warning('Image upload failed', {
              description: 'Continuing with update. Image will be stored locally.',
            });
            profileImageUrl = `local:${newImageFile.name}`;
          }
        } else {
          toast.warning('Image upload failed', {
            description: 'Storage not configured. Image will be stored locally.',
          });
          profileImageUrl = `local:${newImageFile.name}`;
        }
      }

      const updateData = {
        ...editFormData,
        profileImage: profileImageUrl
      };

      const response = await fetch('/api/members', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedMember.id, ...updateData }),
      });

      if (response.ok) {
        const updatedMember = await response.json();
        setMembers(members.map(m => m.id === selectedMember.id ? updatedMember.member : m));
        toast.success('Member updated successfully');
        setIsEditModalOpen(false);
        setEditImagePreview(null);
        setNewImageFile(null);
      } else {
        toast.error('Failed to update member');
      }
    } catch (error) {
      toast.error('Error updating member');
      console.error('Error updating member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const newThisMonth = members.filter(m => new Date(m.createdAt) >= thisMonth).length;

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
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">
            Manage church members and their information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddMember}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
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
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  {totalMembers === 0 ? 'Ready to start counting' : 'Total registered members'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{activeMembers}</div>
                <p className="text-xs text-muted-foreground">
                  {activeMembers === 0 ? 'Awaiting active members' : 'Currently active'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{newThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  {newThisMonth === 0 ? 'No new members yet' : 'Joined this month'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ministries</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalMinistries}</div>
                <p className="text-xs text-muted-foreground">
                  {totalMinistries === 0 ? 'No ministries created' : `${activeMinistries} active ministries`}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter: {filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus("All")}>
              All Members
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("Active")}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("Inactive")}>
              Inactive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Member Directory</CardTitle>
          <CardDescription>
            A list of all church members and their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ministry</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Member ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">Loading members...</p>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No members found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium">{`${member.firstName}${member.middleName ? ' ' + member.middleName : ''} ${member.lastName}`}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 h-3 w-3" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.status === "ACTIVE" ? "default" : "secondary"}
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.ministryNames || 'None'}</TableCell>
                    <TableCell>
                      {new Date(member.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-muted-foreground">
                      {member.id.slice(-8)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditMember(member)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteMember(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              View detailed information about {selectedMember?.firstName} {selectedMember?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="grid gap-6 py-4">
              {/* Profile Image - Centered at Top */}
              <div className="flex justify-center">
                <div className="text-center">
                  <Label className="text-sm font-medium block mb-3">Profile Image</Label>
                  {selectedMember.profileImage && !selectedMember.profileImage.startsWith('local:') ? (
                    <div className="relative">
                      <img
                        src={selectedMember.profileImage}
                        alt={`${selectedMember.firstName} ${selectedMember.lastName}`}
                        className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 shadow-lg mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden">
                        <div className="w-40 h-40 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center mx-auto">
                          <div className="text-center">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Image failed to load</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-full border-4 border-gray-200 bg-gray-50 flex items-center justify-center mx-auto">
                      <div className="text-center">
                        <User className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">
                          {selectedMember.profileImage?.startsWith('local:') ? 'Image upload failed' : 'No image uploaded'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Basic Information */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">First Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.firstName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Middle Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.middleName || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.lastName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.phone || 'Not provided'}</p>
                </div>
              </div>
              
              {/* Address Information */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Subcity</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.subcity || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Kebele</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.kebele || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Special Place Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.specialPlaceName || 'Not provided'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedMember.status === "ACTIVE" ? "default" : "secondary"}>
                    {selectedMember.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Membership Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.membershipType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.dateOfBirth ? new Date(selectedMember.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gender</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.gender || 'Not provided'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Marital Status</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.maritalStatus || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Join Date</Label>
                  <p className="text-sm text-muted-foreground">{new Date(selectedMember.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Children Information */}
              {selectedMember.maritalStatus && selectedMember.maritalStatus !== 'SINGLE' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Number of Children</Label>
                    <p className="text-sm text-muted-foreground">{selectedMember.numberOfChildren || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Children Information</Label>
                    <div className="text-sm text-muted-foreground">
                      {(() => {
                        try {
                          // Try to get childrenInfo first (contains names and ages)
                          let childrenInfo = selectedMember.childrenInfo;
                          if (typeof childrenInfo === 'string') {
                            childrenInfo = JSON.parse(childrenInfo);
                          }
                          
                          if (childrenInfo && Array.isArray(childrenInfo) && childrenInfo.length > 0) {
                            return (
                              <div className="space-y-2">
                                {childrenInfo.map((child, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="font-medium">{child.name || `Child ${index + 1}`}</span>
                                    <span className="text-muted-foreground">{child.age} years old</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          
                          // Fallback to childrenAges if childrenInfo is not available
                          const ages = typeof selectedMember.childrenAges === 'string' 
                            ? JSON.parse(selectedMember.childrenAges) 
                            : selectedMember.childrenAges;
                          
                          if (ages && Array.isArray(ages) && ages.length > 0) {
                            return (
                              <div className="space-y-2">
                                {ages.map((age, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="font-medium">Child {index + 1}</span>
                                    <span className="text-muted-foreground">{age} years old</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          
                          return 'Not provided';
                        } catch {
                          return 'Not provided';
                        }
                      })()
                    }
                    </div>
                  </div>
                </div>
              )}
              
              {/* Professional & Education Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Profession</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.profession || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Education Level</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.educationLevel || 'Not provided'}</p>
                </div>
              </div>
              
              {/* Unique Skills */}
              <div>
                <Label className="text-sm font-medium">Unique Skills</Label>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    try {
                      const skills = typeof selectedMember.uniqueSkills === 'string' 
                        ? JSON.parse(selectedMember.uniqueSkills) 
                        : selectedMember.uniqueSkills;
                      return skills && skills.length > 0 ? skills.join(', ') : 'Not provided';
                    } catch {
                      return 'Not provided';
                    }
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Ministry</Label>
                <p className="text-sm text-muted-foreground">{selectedMember.ministryNames || 'None'}</p>
              </div>
              
              {/* Sale Group Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Sale Group</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.saleGroupName || 'Not assigned'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sale Group Leader</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.saleGroupLeaderName || 'No leader assigned'}</p>
                </div>
              </div>
              
              {/* Zone Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Zone</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.zoneName || 'Not assigned'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Zone Leader</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.zoneLeaderName || 'No leader assigned'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update information for {selectedMember?.firstName} {selectedMember?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Profile Image Section */}
            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="flex items-center space-x-4">
                {/* Current or Preview Image */}
                <div className="relative">
                  {editImagePreview ? (
                    <div className="relative">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeEditImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : editFormData.profileImage && !editFormData.profileImage.startsWith('local:') ? (
                    <div className="relative">
                      <img
                        src={editFormData.profileImage}
                        alt="Current profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeEditImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('editProfileImage')?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Change Image</span>
                  </Button>
                  <Input
                    id="editProfileImage"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleEditImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editFormData.firstName || ''}
                  onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={editFormData.middleName || ''}
                  onChange={(e) => setEditFormData({...editFormData, middleName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editFormData.lastName || ''}
                  onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="membershipType">Membership Type</Label>
                <Select value={editFormData.membershipType} onValueChange={(value) => setEditFormData({...editFormData, membershipType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">Regular</SelectItem>
                    <SelectItem value="ASSOCIATE">Associate</SelectItem>
                    <SelectItem value="HONORARY">Honorary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editFormData.dateOfBirth || ''}
                  onChange={(e) => setEditFormData({...editFormData, dateOfBirth: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={editFormData.gender} onValueChange={(value) => setEditFormData({...editFormData, gender: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select value={editFormData.maritalStatus} onValueChange={(value) => setEditFormData({...editFormData, maritalStatus: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Single</SelectItem>
                  <SelectItem value="MARRIED">Married</SelectItem>
                  <SelectItem value="DIVORCED">Divorced</SelectItem>
                  <SelectItem value="WIDOWED">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Children Information */}
            {editFormData.maritalStatus && editFormData.maritalStatus !== 'SINGLE' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Children Information</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addChild}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Child</span>
                  </Button>
                </div>
                
                {editFormData.childrenInfo && Array.isArray(editFormData.childrenInfo) && editFormData.childrenInfo.length > 0 ? (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Children (Total: {editFormData.numberOfChildren || 0})
                    </Label>
                    <div className="space-y-3">
                      {editFormData.childrenInfo.map((child, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded-lg bg-white">
                          <Label className="text-sm font-medium">Child {index + 1}</Label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <Label className="text-xs text-muted-foreground">Name</Label>
                              <Input
                                type="text"
                                placeholder="Child's name"
                                value={child.name || ''}
                                onChange={(e) => handleChildInfoChange(index, 'name', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div className="w-24">
                              <Label className="text-xs text-muted-foreground">Age</Label>
                              <Input
                                type="number"
                                placeholder="Age"
                                value={child.age || ''}
                                onChange={(e) => handleChildInfoChange(index, 'age', parseInt(e.target.value) || 0)}
                                className="mt-1"
                                min="0"
                                max="30"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeChild(index)}
                              size="sm"
                              variant="destructive"
                              className="mt-5"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No children added yet. Click &quot;Add Child&quot; to add children information.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Member'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {memberToDelete?.firstName} {memberToDelete?.lastName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteMember}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Member'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
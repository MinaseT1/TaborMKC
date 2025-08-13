"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { UserPlus, Calendar, FileText, Users, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { createImagePreview, isValidImage, getFileSizeInMB } from "@/lib/image-utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RegistrationStats {
  newMembers: number;
  baptisms: number;
  transfersIn: number;
  pendingRequests: number;
  recentRegistrations: Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    status: string;
  }>;
}

interface Ministry {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export default function RegistrationPage() {
  const [stats, setStats] = useState<RegistrationStats>({
    newMembers: 0,
    baptisms: 0,
    transfersIn: 0,
    pendingRequests: 0,
    recentRegistrations: []
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [ministriesLoading, setMinistriesLoading] = useState(true);
  const [zones, setZones] = useState<{id: string; name: string; isActive: boolean}[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [saleGroups, setSaleGroups] = useState<{id: string; name: string; leaderName: string; zoneId: string}[]>([]);
  const [saleGroupsLoading, setSaleGroupsLoading] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  
  // Baptism form state
  const [baptismData, setBaptismData] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    dateOfBirth: "",
    baptismDate: "",
    baptismLocation: "",
    minister: "",
    witnesses: ["", ""],
    previousBaptism: "no",
    previousBaptismDetails: "",
    testimony: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    specialRequests: ""
  });
  const [isBaptismSubmitting, setIsBaptismSubmitting] = useState(false);
  
  // Transfer form state
  const [transferData, setTransferData] = useState({
    transferType: "in", // "in" or "out"
    memberName: "",
    memberEmail: "",
    memberPhone: "",
    currentChurch: "",
    currentChurchAddress: "",
    currentPastorName: "",
    currentPastorContact: "",
    destinationChurch: "",
    destinationChurchAddress: "",
    destinationPastorName: "",
    destinationPastorContact: "",
    transferReason: "",
    membershipStartDate: "",
    membershipEndDate: "",
    ministryInvolvement: "",
    financialObligations: "no",
    financialObligationsDetails: "",
    disciplinaryIssues: "no",
    disciplinaryIssuesDetails: "",
    recommendationLetter: null as File | null,
    additionalDocuments: null as File | null,
    notes: ""
  });
  const [isTransferSubmitting, setIsTransferSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    // Address breakdown
    subcity: "",
    kebele: "",
    specialPlaceName: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    // Children information
    numberOfChildren: 0,
    childrenAges: [] as number[],
    childrenInfo: [] as { name: string; age: number }[],
    // Professional and education
    profession: "",
    uniqueSkills: [] as string[],
    educationLevel: "",
    // Profile image
    profileImage: null as File | null,

    ministry: "",
    zoneId: "",
    saleGroupId: "",
    notes: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If zone is selected, fetch sale groups and reset sale group selection
    if (field === 'zoneId' && typeof value === 'string' && value) {
      setSelectedZoneId(value);
      fetchSaleGroups(value);
      setFormData(prev => ({ ...prev, saleGroupId: '' }));
    }
  };

  const fetchSaleGroups = async (zoneId: string) => {
    try {
      setSaleGroupsLoading(true);
      const response = await fetch(`/api/sale-groups?zoneId=${zoneId}`);
      const data = await response.json();
      
      if (response.ok && data.saleGroups) {
        setSaleGroups(data.saleGroups);
      } else {
        console.error('Failed to fetch sale groups:', data.error || 'Unknown error');
        setSaleGroups([]);
      }
    } catch (err) {
      console.error('Error fetching sale groups:', err);
      setSaleGroups([]);
    } finally {
      setSaleGroupsLoading(false);
    }
   };
  
  const handleBaptismInputChange = (field: string, value: string | File | null) => {
    setBaptismData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTransferInputChange = (field: string, value: string | File | null) => {
    setTransferData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleWitnessChange = (index: number, value: string) => {
    const newWitnesses = [...baptismData.witnesses];
    newWitnesses[index] = value;
    setBaptismData(prev => ({ ...prev, witnesses: newWitnesses }));
  };
  
  const addWitness = () => {
    setBaptismData(prev => ({
      ...prev,
      witnesses: [...prev.witnesses, ""]
    }));
  };
  
  const removeWitness = (index: number) => {
    const newWitnesses = baptismData.witnesses.filter((_, i) => i !== index);
    setBaptismData(prev => ({ ...prev, witnesses: newWitnesses }));
  };

  const handleChildrenAgeChange = (index: number, age: number) => {
    const newAges = [...formData.childrenAges];
    newAges[index] = age;
    setFormData(prev => ({ ...prev, childrenAges: newAges }));
  };

  const handleChildInfoChange = (index: number, field: 'name' | 'age', value: string | number) => {
    const newChildrenInfo = [...formData.childrenInfo];
    newChildrenInfo[index] = {
      ...newChildrenInfo[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, childrenInfo: newChildrenInfo }));
  };

  const addChildAge = () => {
    setFormData(prev => ({
      ...prev,
      numberOfChildren: prev.numberOfChildren + 1,
      childrenAges: [...prev.childrenAges, 0]
    }));
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      numberOfChildren: prev.numberOfChildren + 1,
      childrenInfo: [...prev.childrenInfo, { name: '', age: 0 }]
    }));
  };

  const removeChildAge = (index: number) => {
    const newAges = formData.childrenAges.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      numberOfChildren: Math.max(0, prev.numberOfChildren - 1),
      childrenAges: newAges
    }));
  };

  const removeChild = (index: number) => {
    const newChildrenInfo = formData.childrenInfo.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      numberOfChildren: Math.max(0, prev.numberOfChildren - 1),
      childrenInfo: newChildrenInfo
    }));
  };

  const handleSkillChange = (index: number, skill: string) => {
    const newSkills = [...formData.uniqueSkills];
    newSkills[index] = skill;
    setFormData(prev => ({ ...prev, uniqueSkills: newSkills }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      uniqueSkills: [...prev.uniqueSkills, ""]
    }));
  };

  const removeSkill = (index: number) => {
    const newSkills = formData.uniqueSkills.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, uniqueSkills: newSkills }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setImagePreview(previewUrl);
      setFormData(prev => ({ ...prev, profileImage: file }));
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Error processing image', {
        description: 'Failed to process the selected image. Please try again.',
      });
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData(prev => ({ ...prev, profileImage: null }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch registration statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('/api/registration/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setStatsError('Failed to load statistics');
        }
      } catch (err) {
        setStatsError('Failed to connect to database');
        console.error('Error fetching registration stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchMinistries = async () => {
      try {
        setMinistriesLoading(true);
        const response = await fetch('/api/ministries');
        const data = await response.json();
        
        if (data.success) {
          setMinistries(data.ministries.filter((ministry: Ministry) => ministry.isActive));
        }
      } catch (err) {
        console.error('Error fetching ministries:', err);
      } finally {
        setMinistriesLoading(false);
      }
    };

    const fetchZones = async () => {
      try {
        setZonesLoading(true);
        const response = await fetch('/api/zones');
        const data = await response.json();
        
        if (data.zones && Array.isArray(data.zones)) {
          setZones(data.zones.filter(zone => zone.isActive));
        }
      } catch (err) {
        console.error('Error fetching zones:', err);
      } finally {
        setZonesLoading(false);
      }
    };

    fetchStats();
    fetchMinistries();
    fetchZones();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formData.profileImage) {
        toast.info('Processing image...', {
          description: 'Please wait while we process your profile image.',
        });
      }
      
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'childrenAges' || key === 'uniqueSkills' || key === 'childrenInfo') {
          submitData.append(key, JSON.stringify(value));
        } else if (key === 'profileImage' && value) {
          // Send the actual File object to the API
          submitData.append(key, value as File);
        } else if (value !== null && value !== undefined && key !== 'profileImage') {
          submitData.append(key, value.toString());
        }
      });

      const response = await fetch('/api/members', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Member registered successfully!', {
          description: `${formData.firstName} ${formData.lastName} has been added to the church members.`,
          duration: 3000,
        });
        
        // Reset form and clear image preview
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
          phone: "",
          // Address breakdown
          subcity: "",
          kebele: "",
          specialPlaceName: "",
          dateOfBirth: "",
          gender: "",
          maritalStatus: "",
          // Children information
          numberOfChildren: 0,
          childrenAges: [],
          childrenInfo: [],
          // Professional and education
          profession: "",
          uniqueSkills: [],
          educationLevel: "",
          // Profile image
          profileImage: null,

          ministry: "",
          zoneId: "",
          notes: "",
        });
        
        // Refresh stats after successful registration
        const refreshStats = async () => {
          try {
            const response = await fetch('/api/registration/stats');
            const data = await response.json();
            if (data.success) {
              setStats(data.stats);
            }
          } catch (err) {
            console.error('Error refreshing stats:', err);
          }
        };
        refreshStats();
      } else {
        toast.error('Registration failed', {
          description: data.error || 'Please try again later.',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed', {
        description: 'Network error. Please check your connection and try again.',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBaptismSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBaptismSubmitting(true);
    
    try {
      // Here you would typically send the data to your API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Baptism record created successfully!', {
        description: `Baptism record for ${baptismData.candidateName} has been saved.`,
        duration: 3000,
      });
      
      // Reset form
      setBaptismData({
        candidateName: "",
        candidateEmail: "",
        candidatePhone: "",
        dateOfBirth: "",
        baptismDate: "",
        baptismLocation: "",
        minister: "",
        witnesses: ["", ""],
        previousBaptism: "no",
        previousBaptismDetails: "",
        testimony: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        specialRequests: ""
      });
      
    } catch (error) {
      console.error('Baptism submission error:', error);
      toast.error('Failed to create baptism record', {
        description: 'Please try again later.',
        duration: 3000,
      });
    } finally {
      setIsBaptismSubmitting(false);
    }
  };
  
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferSubmitting(true);
    
    try {
      // Here you would typically send the data to your API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Transfer request submitted successfully!', {
        description: `Transfer request for ${transferData.memberName} has been processed.`,
        duration: 3000,
      });
      
      // Reset form
      setTransferData({
        transferType: "in",
        memberName: "",
        memberEmail: "",
        memberPhone: "",
        currentChurch: "",
        currentChurchAddress: "",
        currentPastorName: "",
        currentPastorContact: "",
        destinationChurch: "",
        destinationChurchAddress: "",
        destinationPastorName: "",
        destinationPastorContact: "",
        transferReason: "",
        membershipStartDate: "",
        membershipEndDate: "",
        ministryInvolvement: "",
        financialObligations: "no",
        financialObligationsDetails: "",
        disciplinaryIssues: "no",
        disciplinaryIssuesDetails: "",
        recommendationLetter: null,
        additionalDocuments: null,
        notes: ""
      });
      
    } catch (error) {
      console.error('Transfer submission error:', error);
      toast.error('Failed to submit transfer request', {
        description: 'Please try again later.',
        duration: 3000,
      });
    } finally {
      setIsTransferSubmitting(false);
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
          <h2 className="text-3xl font-bold tracking-tight">Registration</h2>
          <p className="text-muted-foreground">
            Register new members and manage church records
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Members</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.newMembers}</div>
                <p className="text-xs text-muted-foreground">
                  {statsError ? 'Error loading data' :
                   stats.newMembers === 0 ? 'No new members yet' : 'New members this month'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="new-member" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new-member">New Member</TabsTrigger>
          <TabsTrigger value="recent">Recent Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="new-member" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Member Registration</CardTitle>
              <CardDescription>
                Register a new member to Meserete Kristos Church
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  
                  {/* Profile Image */}
                  <div className="space-y-4">
                    <Label htmlFor="profileImage">Profile Image</Label>
                    
                    {/* Image Preview */}
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={imagePreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            {formData.profileImage?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Size: {formData.profileImage ? getFileSizeInMB(formData.profileImage).toFixed(2) : '0'}MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('profileImage')?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            const file = files[0];
                            handleImageUpload({ target: { files: [file] } } as any);
                          }
                        }}
                      >
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload or drag and drop
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PNG, JPG, WebP up to 5MB
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={false}
                    />

                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleName">Middle Name *</Label>
                      <Input
                        id="middleName"
                        value={formData.middleName}
                        onChange={(e) => handleInputChange("middleName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Phone number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select onValueChange={(value) => handleInputChange("gender", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Marital Status *</Label>
                      <Select onValueChange={(value) => handleInputChange("maritalStatus", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Children Information - Show only if not single */}
                  {formData.maritalStatus && formData.maritalStatus !== 'single' && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <h4 className="text-md font-medium">Children Information</h4>
                      <div className="space-y-2">
                        <Label>Number of Children: {formData.numberOfChildren}</Label>
                        <Button type="button" onClick={addChild} size="sm" variant="outline">
                          Add Child
                        </Button>
                      </div>
                      {formData.childrenInfo.map((child, index) => (
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
                  )}
                  
                  {/* Address Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Address Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subcity">Subcity *</Label>
                        <Input
                          id="subcity"
                          value={formData.subcity}
                          onChange={(e) => handleInputChange("subcity", e.target.value)}
                          placeholder="e.g., Bole, Kirkos"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kebele">Kebele *</Label>
                        <Input
                          id="kebele"
                          value={formData.kebele}
                          onChange={(e) => handleInputChange("kebele", e.target.value)}
                          placeholder="e.g., 01, 02"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialPlaceName">Special Place Name *</Label>
                        <Input
                          id="specialPlaceName"
                          value={formData.specialPlaceName}
                          onChange={(e) => handleInputChange("specialPlaceName", e.target.value)}
                          placeholder="e.g., Near Bole Airport"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Professional and Education Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Professional & Education Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="profession">Main Profession *</Label>
                        <Input
                          id="profession"
                          value={formData.profession}
                          onChange={(e) => handleInputChange("profession", e.target.value)}
                          placeholder="e.g., Teacher, Engineer, Doctor"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="educationLevel">Education Level *</Label>
                        <Select onValueChange={(value) => handleInputChange("educationLevel", value)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                            <SelectItem value="master">Master's Degree</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="vocational">Vocational Training</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Unique Skills */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Unique Skills</Label>
                        <Button type="button" onClick={addSkill} size="sm" variant="outline">
                          Add Skill
                        </Button>
                      </div>
                      {formData.uniqueSkills.map((skill, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="e.g., Music, Teaching, Counseling"
                            value={skill}
                            onChange={(e) => handleSkillChange(index, e.target.value)}
                          />
                          <Button
                            type="button"
                            onClick={() => removeSkill(index)}
                            size="sm"
                            variant="destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>



                {/* Church Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Church Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                    <div className="space-y-2">
                      <Label htmlFor="ministry">Interested Ministry</Label>
                      <Select onValueChange={(value) => handleInputChange("ministry", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={ministriesLoading ? "Loading ministries..." : ministries.length === 0 ? "No ministries available" : "Select ministry"} />
                        </SelectTrigger>
                        <SelectContent>
                          {ministriesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading ministries...
                            </SelectItem>
                          ) : ministries.length === 0 ? (
                            <SelectItem value="no-ministries" disabled>
                              No ministries created yet
                            </SelectItem>
                          ) : (
                            ministries.map((ministry) => (
                              <SelectItem key={ministry.id} value={ministry.name}>
                                {ministry.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {!ministriesLoading && ministries.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No ministries have been created yet. Please contact an administrator to create ministries first.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zone">Zone *</Label>
                      <Select onValueChange={(value) => handleInputChange("zoneId", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder={zonesLoading ? "Loading zones..." : zones.length === 0 ? "No zones available" : "Select zone"} />
                        </SelectTrigger>
                        <SelectContent>
                          {zonesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading zones...
                            </SelectItem>
                          ) : zones.length === 0 ? (
                            <SelectItem value="no-zones" disabled>
                              No zones created yet
                            </SelectItem>
                          ) : (
                            zones.map((zone) => (
                              <SelectItem key={zone.id} value={zone.id}>
                                {zone.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {!zonesLoading && zones.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No zones have been created yet. Please contact an administrator to create zones first.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="saleGroup">Sale Group *</Label>
                      <Select 
                        onValueChange={(value) => handleInputChange("saleGroupId", value)} 
                        required
                        disabled={!selectedZoneId || saleGroupsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              !selectedZoneId ? "Select a zone first" :
                              saleGroupsLoading ? "Loading sale groups..." : 
                              saleGroups.length === 0 ? "No sale groups available" : 
                              "Select sale group"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {saleGroupsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading sale groups...
                            </SelectItem>
                          ) : saleGroups.length === 0 ? (
                            <SelectItem value="no-sale-groups" disabled>
                              No sale groups in this zone
                            </SelectItem>
                          ) : (
                            saleGroups.map((saleGroup) => (
                              <SelectItem key={saleGroup.id} value={saleGroup.id}>
                                {saleGroup.name} (Leader: {saleGroup.leaderName})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {selectedZoneId && !saleGroupsLoading && saleGroups.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No sale groups have been created in this zone yet. Please contact an administrator to create sale groups first.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      rows={3}
                      placeholder="Any additional information..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Registering...' : 'Register Member'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
              <CardDescription>
                View and manage recent registration requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2 text-muted-foreground">Loading registrations...</p>
                      </TableCell>
                    </TableRow>
                  ) : statsError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-red-600">{statsError}</p>
                      </TableCell>
                    </TableRow>
                  ) : stats.recentRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No recent registrations found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.id}</TableCell>
                        <TableCell>{registration.name}</TableCell>
                        <TableCell>{registration.type}</TableCell>
                        <TableCell>{registration.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              registration.status === "Completed" ? "default" :
                              registration.status === "Approved" ? "secondary" :
                              "outline"
                            }
                          >
                            {registration.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
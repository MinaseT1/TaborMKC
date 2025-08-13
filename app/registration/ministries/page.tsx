"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { refreshDashboardStats } from "@/hooks/use-dashboard-stats"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Users, Calendar, MapPin, Plus, X } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function NewMinistryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leaders: [""],
    category: "",
    meetingDay: "",
    meetingTime: "",
    location: "",
    capacity: "",
    isActive: true,
    requirements: "",
    contactEmail: "",
    contactPhone: ""
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLeaderChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      leaders: prev.leaders.map((leader, i) => i === index ? value : leader)
    }))
  }

  const addLeader = () => {
    setFormData(prev => ({
      ...prev,
      leaders: [...prev.leaders, ""]
    }))
  }

  const removeLeader = (index: number) => {
    if (formData.leaders.length > 1) {
      setFormData(prev => ({
        ...prev,
        leaders: prev.leaders.filter((_, i) => i !== index)
      }))
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Filter out empty leaders and prepare data
      const filteredLeaders = formData.leaders.filter(leader => leader.trim() !== "")
      const submitData = {
        ...formData,
        leader: filteredLeaders.join(", "), // For backward compatibility with API
        leaders: filteredLeaders
      }

      const response = await fetch('/api/ministries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Ministry registered successfully!', {
          description: `${formData.name} has been added to your church ministries.`,
          duration: 5000,
        })
        
        // Refresh dashboard stats immediately
        await refreshDashboardStats()
        
        // Reset form
        setFormData({
          name: "",
          description: "",
          leaders: [""],
          category: "",
          meetingDay: "",
          meetingTime: "",
          location: "",
          capacity: "",
          isActive: true,
          requirements: "",
          contactEmail: "",
          contactPhone: ""
        })
        
        // Navigate to ministries page after a short delay
        setTimeout(() => {
          router.push("/ministries")
        }, 2000)
      } else {
        toast.error(data.error || 'Failed to register ministry', {
          description: 'Please check your information and try again.',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error registering ministry:', error)
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please try again.',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
              <div className="flex items-center gap-4 mb-6">
                
                <div>
                  <h1 className="text-3xl font-bold">Register New Ministry</h1>
                  <p className="text-muted-foreground">Create a new ministry in your church</p>
                </div>
              </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the basic details about the ministry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ministry Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Youth Ministry"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youth">Youth Ministry</SelectItem>
                    <SelectItem value="children">Children&apos;s Ministry</SelectItem>
                    <SelectItem value="worship">Worship Team</SelectItem>
                    <SelectItem value="outreach">Outreach</SelectItem>
                    <SelectItem value="prayer">Prayer Team</SelectItem>
                    <SelectItem value="media">Media Team</SelectItem>
                    <SelectItem value="education">Christian Education</SelectItem>
                    <SelectItem value="fellowship">Fellowship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the ministry's purpose and activities"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Ministry Leaders *</Label>
              <div className="space-y-2">
                {formData.leaders.map((leader, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={leader}
                      onChange={(e) => handleLeaderChange(index, e.target.value)}
                      placeholder={`Enter leader ${index + 1} name`}
                      required={index === 0}
                    />
                    {formData.leaders.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeLeader(index)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLeader}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Leader
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meeting Schedule
            </CardTitle>
            <CardDescription>
              Set up the regular meeting schedule for this ministry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meetingDay">Meeting Day</Label>
                <Select value={formData.meetingDay} onValueChange={(value) => handleInputChange("meetingDay", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingTime">Meeting Time</Label>
                <Input
                  id="meetingTime"
                  type="time"
                  value={formData.meetingTime}
                  onChange={(e) => handleInputChange("meetingTime", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Capacity
            </CardTitle>
            <CardDescription>
              Specify where the ministry meets and its capacity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Meeting Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g., Main Sanctuary, Room 101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Maximum Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  placeholder="Enter number"
                  min="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Contact details for ministry inquiries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="ministry@church.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements/Prerequisites</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
                placeholder="Any special requirements or prerequisites for joining this ministry"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ministry Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked as boolean)}
              />
              <Label htmlFor="isActive">Ministry is currently active</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 pt-6">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Registering...' : 'Register Ministry'}
          </Button>
          <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
            Cancel
          </Button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
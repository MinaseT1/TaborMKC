"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users, Edit, Trash2, UserCheck } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface Zone {
  id: string
  name: string
  description?: string
  leaderName?: string
  isActive: boolean
  saleGroupCount: number
  saleGroups: {
    id: string
    name: string
    leaderName: string
    memberCount: number
  }[]
  createdAt: string
  updatedAt: string
  notes?: string
}

interface Member {
  id: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
}

export default function ZonesPage() {
  const router = useRouter()
  const [zones, setZones] = useState<Zone[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaderName: '',
    notes: ''
  })

  useEffect(() => {
    fetchZones()
    fetchMembers()
  }, [])

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/zones')
      if (response.ok) {
        const data = await response.json()
        setZones(data.zones || [])
      } else {
        toast.error('Failed to fetch zones')
      }
    } catch (error) {
      console.error('Error fetching zones:', error)
      toast.error('Failed to fetch zones')
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched members data:', data)
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }



  const handleCreateZone = async () => {
    try {
      const response = await fetch('/api/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          leaderName: formData.leaderName || null,
          notes: formData.notes
        }),
      })

      if (response.ok) {
        const newZone = await response.json()
        setZones([...zones, newZone])
        setIsCreateDialogOpen(false)
        setFormData({ name: '', description: '', leaderName: '', notes: '' })
        toast.success('Zone created successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create zone')
      }
    } catch (error) {
      console.error('Error creating zone:', error)
      toast.error('Failed to create zone')
    }
  }

  const handleEditZone = async () => {
    if (!editingZone) return

    try {
      const response = await fetch(`/api/zones/${editingZone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          leaderName: formData.leaderName || null,
          notes: formData.notes
        }),
      })

      if (response.ok) {
        const updatedZone = await response.json()
        setZones(zones.map(zone => zone.id === editingZone.id ? updatedZone : zone))
        setIsEditDialogOpen(false)
        setEditingZone(null)
        setFormData({ name: '', description: '', leaderName: '', notes: '' })
        toast.success('Zone updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update zone')
      }
    } catch (error) {
      console.error('Error updating zone:', error)
      toast.error('Failed to update zone')
    }
  }

  const handleDeleteZone = async (zoneId: string) => {
    try {
      const response = await fetch(`/api/zones/${zoneId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setZones(zones.filter(zone => zone.id !== zoneId))
        toast.success('Zone deleted successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete zone')
      }
    } catch (error) {
      console.error('Error deleting zone:', error)
      toast.error('Failed to delete zone')
    }
  }

  const openEditDialog = (zone: Zone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      description: zone.description || '',
      leaderName: zone.leaderName || '',
      notes: zone.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', leaderName: '', notes: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading zones...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Zone Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage church zones for neighborhood Bible study groups
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Zone</DialogTitle>
              <DialogDescription>
                Create a new zone for neighborhood Bible study groups.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Zone 1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Zone description..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leader" className="text-right">
                  Leader
                </Label>
                <Input
                  id="leader"
                  value={formData.leaderName}
                  onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter leader name..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="col-span-3"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateZone}>
                Create Zone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => (
          <Card 
            key={zone.id} 
            className="relative cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/pastoral/zones/${zone.id}`)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {zone.name}
                    {zone.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{zone.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditDialog(zone)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the zone.
                          {zone.saleGroupCount > 0 && (
                            <span className="text-red-600 font-medium">
                              {' '}This zone has {zone.saleGroupCount} sale groups. Please reassign them first.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteZone(zone.id)}
                          disabled={zone.memberCount > 0}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {zone.saleGroupCount} {zone.saleGroupCount === 1 ? 'sale group' : 'sale groups'}
                  </span>
                </div>
                {zone.leaderName && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Leader: {zone.leaderName}
                    </span>
                  </div>
                )}
                {zone.notes && (
                  <p className="text-sm text-muted-foreground">{zone.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {zones.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No zones</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating a new zone.
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
            <DialogDescription>
              Update zone information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-leader" className="text-right">
                Leader
              </Label>
              <Input
                id="edit-leader"
                value={editingZone?.leaderName || ''}
                onChange={(e) => setEditingZone({ ...editingZone!, leaderName: e.target.value })}
                className="col-span-3"
                placeholder="Enter leader name..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditZone}>
              Update Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
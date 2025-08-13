"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Users, Edit, Trash2, UserCheck, ArrowLeft } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Zone {
  id: string
  name: string
  description?: string
  leaderName?: string
  isActive: boolean
  notes?: string
}

interface SaleGroup {
  id: string
  name: string
  leaderName: string
  memberCount: number
  isActive: boolean
  notes?: string
  zone: {
    id: string
    name: string
  }
}

export default function SaleGroupsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedZoneId = searchParams.get('zoneId')
  
  const [zones, setZones] = useState<Zone[]>([])
  const [saleGroups, setSaleGroups] = useState<SaleGroup[]>([])
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSaleGroup, setEditingSaleGroup] = useState<SaleGroup | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    leaderName: '',
    notes: '',
    zoneId: selectedZoneId || ''
  })

  useEffect(() => {
    fetchZones()
    if (selectedZoneId) {
      fetchSaleGroups(selectedZoneId)
    }
  }, [selectedZoneId])

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/zones')
      if (response.ok) {
        const data = await response.json()
        setZones(data.zones || [])
        
        // Set selected zone if zoneId is provided
        if (selectedZoneId) {
          const zone = data.zones.find((z: Zone) => z.id === selectedZoneId)
          setSelectedZone(zone || null)
          setFormData(prev => ({ ...prev, zoneId: selectedZoneId }))
        }
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

  const fetchSaleGroups = async (zoneId: string) => {
    try {
      const response = await fetch(`/api/zones/${zoneId}/sale-groups`)
      if (response.ok) {
        const data = await response.json()
        setSaleGroups(data.saleGroups || [])
      } else {
        toast.error('Failed to fetch sale groups')
      }
    } catch (error) {
      console.error('Error fetching sale groups:', error)
      toast.error('Failed to fetch sale groups')
    }
  }

  const handleZoneChange = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId)
    setSelectedZone(zone || null)
    setFormData(prev => ({ ...prev, zoneId }))
    
    // Update URL with selected zone
    const url = new URL(window.location.href)
    url.searchParams.set('zoneId', zoneId)
    window.history.pushState({}, '', url.toString())
    
    fetchSaleGroups(zoneId)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      leaderName: '',
      notes: '',
      zoneId: selectedZone?.id || ''
    })
  }

  const openEditDialog = (saleGroup: SaleGroup) => {
    setEditingSaleGroup(saleGroup)
    setFormData({
      name: saleGroup.name,
      leaderName: saleGroup.leaderName,
      notes: saleGroup.notes || '',
      zoneId: saleGroup.zone.id
    })
    setIsEditDialogOpen(true)
  }

  const handleCreateSaleGroup = async () => {
    if (!formData.zoneId) {
      toast.error('Please select a zone')
      return
    }

    try {
      const response = await fetch(`/api/zones/${formData.zoneId}/sale-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          leaderName: formData.leaderName || null,
          notes: formData.notes
        }),
      })

      if (response.ok) {
        const newSaleGroup = await response.json()
        setSaleGroups([...saleGroups, newSaleGroup])
        setIsCreateDialogOpen(false)
        resetForm()
        toast.success('Sale group created successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create sale group')
      }
    } catch (error) {
      console.error('Error creating sale group:', error)
      toast.error('Failed to create sale group')
    }
  }

  const handleEditSaleGroup = async () => {
    if (!editingSaleGroup) return

    try {
      const response = await fetch(`/api/sale-groups/${editingSaleGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          leaderName: formData.leaderName || null,
          notes: formData.notes,
          zoneId: formData.zoneId
        }),
      })

      if (response.ok) {
        const updatedSaleGroup = await response.json()
        setSaleGroups(saleGroups.map(sg => sg.id === editingSaleGroup.id ? updatedSaleGroup : sg))
        setIsEditDialogOpen(false)
        setEditingSaleGroup(null)
        resetForm()
        toast.success('Sale group updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update sale group')
      }
    } catch (error) {
      console.error('Error updating sale group:', error)
      toast.error('Failed to update sale group')
    }
  }

  const handleDeleteSaleGroup = async (saleGroupId: string) => {
    try {
      const response = await fetch(`/api/sale-groups/${saleGroupId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSaleGroups(saleGroups.filter(sg => sg.id !== saleGroupId))
        toast.success('Sale group deleted successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete sale group')
      }
    } catch (error) {
      console.error('Error deleting sale group:', error)
      toast.error('Failed to delete sale group')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/pastoral/zones')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Zones
            </Button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Sale Group Management</h1>
              <p className="text-muted-foreground mt-2">
                {selectedZone ? `Manage sale groups for ${selectedZone.name}` : 'Select a zone to manage sale groups'}
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} disabled={!selectedZone}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Sale Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Sale Group</DialogTitle>
                  <DialogDescription>
                    Create a new sale group for the selected zone.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="zone" className="text-right">
                      Zone
                    </Label>
                    <Select value={formData.zoneId} onValueChange={(value) => setFormData({ ...formData, zoneId: value })}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Sale Group 1"
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
                  <Button type="submit" onClick={handleCreateSaleGroup}>
                    Create Sale Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Zone Selection */}
          <div className="mb-6">
            <Label htmlFor="zone-select" className="text-sm font-medium mb-2 block">
              Select Zone
            </Label>
            <Select value={selectedZone?.id || ''} onValueChange={handleZoneChange}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a zone to manage sale groups" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedZone && (
            <>
              <div className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {selectedZone.name}
                      {selectedZone.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{selectedZone.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {saleGroups.length} {saleGroups.length === 1 ? 'sale group' : 'sale groups'}
                        </span>
                      </div>
                      {selectedZone.leaderName && (
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Leader: {selectedZone.leaderName}
                          </span>
                        </div>
                      )}
                      {selectedZone.notes && (
                        <p className="text-sm text-muted-foreground">{selectedZone.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {saleGroups.map((saleGroup) => (
                  <Card key={saleGroup.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {saleGroup.name}
                            {saleGroup.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>Zone: {saleGroup.zone.name}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(saleGroup)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the sale group.
                                  {saleGroup.memberCount > 0 && (
                                    <span className="text-red-600 font-medium">
                                      {' '}This sale group has {saleGroup.memberCount} members. Please reassign them first.
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSaleGroup(saleGroup.id)}
                                  disabled={saleGroup.memberCount > 0}
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
                            {saleGroup.memberCount} {saleGroup.memberCount === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                        {saleGroup.leaderName && (
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Leader: {saleGroup.leaderName}
                            </span>
                          </div>
                        )}
                        {saleGroup.notes && (
                          <p className="text-sm text-muted-foreground">{saleGroup.notes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {saleGroups.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No sale groups</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by creating a new sale group for this zone.
                  </p>
                </div>
              )}
            </>
          )}

          {!selectedZone && zones.length > 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Select a zone</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a zone from the dropdown above to view and manage its sale groups.
              </p>
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Sale Group</DialogTitle>
                <DialogDescription>
                  Update sale group information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-zone" className="text-right">
                    Zone
                  </Label>
                  <Select value={formData.zoneId} onValueChange={(value) => setFormData({ ...formData, zoneId: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  <Label htmlFor="edit-leader" className="text-right">
                    Leader
                  </Label>
                  <Input
                    id="edit-leader"
                    value={formData.leaderName}
                    onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
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
                <Button type="submit" onClick={handleEditSaleGroup}>
                  Update Sale Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
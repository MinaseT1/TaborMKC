"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function ZoneDetailPage() {
  const params = useParams()
  const router = useRouter()
  const zoneId = params.id as string
  
  const [zone, setZone] = useState<Zone | null>(null)
  const [saleGroups, setSaleGroups] = useState<SaleGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSaleGroup, setEditingSaleGroup] = useState<SaleGroup | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    leaderName: '',
    notes: ''
  })

  useEffect(() => {
    if (zoneId) {
      fetchData()
    }
  }, [zoneId])

  const fetchZone = async () => {
    try {
      const response = await fetch(`/api/zones/${zoneId}`)
      if (response.ok) {
        const data = await response.json()
        setZone(data)
      } else {
        toast.error('Failed to fetch zone details')
        router.push('/pastoral/zones')
      }
    } catch (error) {
      console.error('Error fetching zone:', error)
      toast.error('Failed to fetch zone details')
      router.push('/pastoral/zones')
    }
  }

  const fetchSaleGroups = async () => {
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

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchZone(), fetchSaleGroups()])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSaleGroup = async () => {
    try {
      const response = await fetch(`/api/zones/${zoneId}/sale-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          leaderName: formData.leaderName,
          notes: formData.notes
        }),
      })

      if (response.ok) {
        const newSaleGroup = await response.json()
        setSaleGroups([...saleGroups, newSaleGroup])
        setIsCreateDialogOpen(false)
        setFormData({ name: '', leaderName: '', notes: '' })
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
          leaderName: formData.leaderName,
          notes: formData.notes
        }),
      })

      if (response.ok) {
        const updatedSaleGroup = await response.json()
        setSaleGroups(saleGroups.map(group => group.id === editingSaleGroup.id ? updatedSaleGroup : group))
        setIsEditDialogOpen(false)
        setEditingSaleGroup(null)
        setFormData({ name: '', leaderName: '', notes: '' })
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
        setSaleGroups(saleGroups.filter(group => group.id !== saleGroupId))
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

  const openEditDialog = (saleGroup: SaleGroup) => {
    setEditingSaleGroup(saleGroup)
    setFormData({
      name: saleGroup.name,
      leaderName: saleGroup.leaderName,
      notes: saleGroup.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading zone data...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!zone) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
              <div className="text-center">Zone not found</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/pastoral/zones')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Zones
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{zone.name}</h1>
                  <p className="text-muted-foreground">
                    {zone.description || 'Manage sale groups in this zone'}
                  </p>
                </div>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sale Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Sale Group</DialogTitle>
                    <DialogDescription>
                      Add a new sale group to {zone.name}.
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
                        placeholder="e.g., John's Sale Group"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="leaderName" className="text-right">
                        Leader
                      </Label>
                      <Input
                        id="leaderName"
                        value={formData.leaderName}
                        onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                        className="col-span-3"
                        placeholder="Leader name"
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
                        <CardDescription>Leader: {saleGroup.leaderName}</CardDescription>
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
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {saleGroup.memberCount} {saleGroup.memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>
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
                  Get started by creating a new sale group in this zone.
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
                    <Label htmlFor="edit-leaderName" className="text-right">
                      Leader
                    </Label>
                    <Input
                      id="edit-leaderName"
                      value={formData.leaderName}
                      onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                      className="col-span-3"
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
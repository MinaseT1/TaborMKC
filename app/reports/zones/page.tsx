"use client"

import { useState, useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { Download, Filter, Search, Users, MapPin, TrendingUp, Activity, Award } from "lucide-react"

// Zone reports page - shows zone-specific statistics and reports

interface ZoneData {
  totalZones: number
  totalMembers: number
  totalSaleGroups: number
  averageMembersPerZone: number
  monthlyGrowth: number
  zoneStats: Array<{
    name: string
    members: number
    leaderName: string | null
    growth: number
    isActive: boolean
  }>
  membershipTrends: Array<{
    month: string
    members: number
  }>
  zoneDistribution: Array<{
    zone: string
    members: number
    percentage: number
  }>
}

const defaultZoneData: ZoneData = {
  totalZones: 0,
  totalMembers: 0,
  totalSaleGroups: 0,
  averageMembersPerZone: 0,
  monthlyGrowth: 0,
  zoneStats: [],
  membershipTrends: [],
  zoneDistribution: []
}

export default function ZoneReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('1month')
  const [selectedZone, setSelectedZone] = useState('all')
  const [zoneData, setZoneData] = useState<ZoneData>(defaultZoneData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchZoneData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/reports?type=zones&period=${selectedPeriod}`)
      if (!response.ok) {
        throw new Error('Failed to fetch zone data')
      }
      const data = await response.json()
      setZoneData(data.zones || defaultZoneData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setZoneData(defaultZoneData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchZoneData()
  }, [selectedPeriod])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Zone Reports</h2>
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {zoneData.zoneStats.map((zone) => (
                    <SelectItem key={zone.name} value={zone.name.toLowerCase()}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Error: {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{zoneData.totalZones}</div>
                    <p className="text-xs text-muted-foreground">
                      Active zones in the church
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{zoneData.totalMembers}</div>
                    <p className="text-xs text-muted-foreground">
                      Members across all zones
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sale Groups</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{zoneData.totalSaleGroups}</div>
                    <p className="text-xs text-muted-foreground">
                      Active sale groups across all zones
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{zoneData.monthlyGrowth}%</div>
                    <p className="text-xs text-muted-foreground">
                      Growth in zone membership
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Zone Membership Trends</CardTitle>
                    <CardDescription>
                      Membership growth across zones over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={zoneData.membershipTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="members" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Zone Distribution</CardTitle>
                    <CardDescription>
                      Member distribution across zones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={zoneData.zoneDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} (${percentage}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="members"
                        >
                          {zoneData.zoneDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Zone Statistics Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Zone Statistics</CardTitle>
                  <CardDescription>
                    Detailed statistics for each zone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zone Name</TableHead>
                        <TableHead>Leader</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Growth</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zoneData.zoneStats.map((zone) => (
                        <TableRow key={zone.name}>
                          <TableCell className="font-medium">{zone.name}</TableCell>
                          <TableCell>{zone.leaderName || 'No Leader'}</TableCell>
                          <TableCell>{zone.members}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={zone.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {zone.growth >= 0 ? '+' : ''}{zone.growth}%
                              </span>
                              <Progress 
                                value={Math.abs(zone.growth)} 
                                className="w-16 h-2" 
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={zone.isActive ? 'default' : 'secondary'}>
                              {zone.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Zone Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Zone Performance</CardTitle>
                  <CardDescription>
                    Member count comparison across zones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={zoneData.zoneStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="members" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
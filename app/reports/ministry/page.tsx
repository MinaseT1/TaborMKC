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
import { Download, Filter, Search, Users, Calendar, TrendingUp, Activity, Award } from "lucide-react"

// Ministry reports page - now uses real data from API

interface MinistryData {
  totalMinistries: number
  activeMembers: number
  participationRate: number
  monthlyGrowth: number
  ministryStats: Array<{
    name: string
    members: number
    leaders: number
    activities: number
    growth: number
  }>
  participationTrends: Array<{
    month: string
    participation: number
  }>
  leadershipData: Array<{
    ministry: string
    leaders: number
    members: number
    ratio: number
  }>
}

const defaultMinistryData: MinistryData = {
  totalMinistries: 0,
  activeMembers: 0,
  participationRate: 0,
  monthlyGrowth: 0,
  ministryStats: [],
  participationTrends: [],
  leadershipData: []
}

export default function MinistryReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('1month')
  const [selectedMinistry, setSelectedMinistry] = useState('all')
  const [ministryData, setMinistryData] = useState<MinistryData>(defaultMinistryData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMinistryData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/reports?type=ministry&period=${selectedPeriod}`)
      if (!response.ok) {
        throw new Error('Failed to fetch ministry data')
      }
      const data = await response.json()
      setMinistryData(data.ministry || defaultMinistryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setMinistryData(defaultMinistryData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMinistryData()
  }, [selectedPeriod])

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Ministry Reports</h2>
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
              <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select ministry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ministries</SelectItem>
                  <SelectItem value="worship">Worship Team</SelectItem>
                  <SelectItem value="youth">Youth Ministry</SelectItem>
                  <SelectItem value="children">Children&apos;s Ministry</SelectItem>
                  <SelectItem value="outreach">Outreach</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Error: {error}
            </div>
          )}

          {/* Key Ministry Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ministries</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : ministryData.totalMinistries}</div>
                <p className="text-xs text-muted-foreground">Active ministries</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : ministryData.activeMembers}</div>
                <p className="text-xs text-muted-foreground">Participating members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : `${ministryData.participationRate}%`}</div>
                <p className="text-xs text-muted-foreground">Of total members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : `+${ministryData.monthlyGrowth}%`}</div>
                <p className="text-xs text-muted-foreground">New participants</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Ministry Participation Trends</CardTitle>
                <CardDescription>Monthly participation growth across ministries</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={ministryData.participationTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="participation" stroke="#8884d8" strokeWidth={2} name="Participation" />

                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ministry Leadership Ratio</CardTitle>
                <CardDescription>Members to leaders ratio by ministry</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={ministryData.leadershipData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ministry" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ratio" fill="#8884d8" name="Members per Leader" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Ministry Participation Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ministry Participation Overview</CardTitle>
              <CardDescription>Current participation rates by ministry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search ministries..." className="pl-8" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ministries</SelectItem>
                      <SelectItem value="high">High Participation</SelectItem>
                      <SelectItem value="medium">Medium Participation</SelectItem>
                      <SelectItem value="low">Low Participation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ministry</TableHead>
                      <TableHead>Total Members</TableHead>
                      <TableHead>Active Members</TableHead>
                      <TableHead>Participation Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : (ministryData.ministryParticipation || []).map((ministry) => (
                      <TableRow key={ministry.ministry}>
                        <TableCell className="font-medium">{ministry.ministry}</TableCell>
                        <TableCell>{ministry.members}</TableCell>
                        <TableCell>{ministry.active}</TableCell>
                        <TableCell>{ministry.percentage}%</TableCell>
                        <TableCell>
                          <Badge 
                            variant={ministry.percentage >= 90 ? "default" : ministry.percentage >= 80 ? "secondary" : "destructive"}
                          >
                            {ministry.percentage >= 90 ? "Excellent" : ministry.percentage >= 80 ? "Good" : "Needs Attention"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Ministry Statistics Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Ministry Statistics Overview</CardTitle>
              <CardDescription>Detailed statistics for each ministry</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ministry</TableHead>
                    <TableHead>Total Members</TableHead>
                    <TableHead>Leaders</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead>Growth Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : (ministryData.ministryStats || []).map((ministry) => (
                    <TableRow key={ministry.name}>
                      <TableCell className="font-medium">{ministry.name}</TableCell>
                      <TableCell>{ministry.members}</TableCell>
                      <TableCell>{ministry.leaders}</TableCell>
                      <TableCell>{ministry.activities}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={ministry.growth > 10 ? "default" : ministry.growth > 0 ? "secondary" : "destructive"}
                        >
                          {ministry.growth > 0 ? '+' : ''}{ministry.growth}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
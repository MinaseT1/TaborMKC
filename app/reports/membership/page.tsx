"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  Download, 
  Filter,
  Calendar,
  UserPlus,
  UserMinus,
  Activity
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

interface MembershipData {
  totalMembers: number;
  newMembers: number;
  ageDistribution: Array<{ name: string; value: number; color: string }>;
  monthlyGrowth: Array<{ month: string; members: number; newMembers: number; retention: number }>;
  membershipByStatus: Array<{ status: string; count: number; percentage: number }>;
}

const defaultData: MembershipData = {
  totalMembers: 0,
  newMembers: 0,
  ageDistribution: [],
  monthlyGrowth: [],
  membershipByStatus: []
};

export default function MembershipStatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("growth");
  const [membershipData, setMembershipData] = useState<MembershipData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembershipData();
  }, [selectedPeriod]);

  const fetchMembershipData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/reports?type=membership&period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Failed to fetch membership data');
      }
      const data = await response.json();
      
      // Access the membership data from the response
      const membershipData = data.membership || {};
      
      // Ensure data has the expected structure with fallbacks
      const validatedData: MembershipData = {
        totalMembers: membershipData.totalMembers || 0,
        newMembers: membershipData.newMembers || 0,
        ageDistribution: Array.isArray(membershipData.ageDistribution) ? membershipData.ageDistribution : [],
        monthlyGrowth: Array.isArray(membershipData.monthlyGrowth) ? membershipData.monthlyGrowth : [],
        membershipByStatus: Array.isArray(membershipData.membershipByStatus) ? membershipData.membershipByStatus : []
      };
      
      setMembershipData(validatedData);
    } catch (err) {
      console.error('Error fetching membership data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      // Set default data on error to prevent undefined access
      setMembershipData(defaultData);
    } finally {
      setLoading(false);
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
                  <h2 className="text-3xl font-bold tracking-tight">Membership Statistics</h2>
                  <p className="text-muted-foreground">
                    Comprehensive membership analytics and trends
                  </p>
                </div>
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

                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  Error: {error}
                </div>
              )}

              {/* Key Metrics */}
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
                        <div className="text-2xl font-bold">{membershipData.totalMembers ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                          Active members
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Members</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <>
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{membershipData.newMembers ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                          In selected period
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <>
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {`${membershipData.membershipByStatus?.find?.(s => s.status === 'Active')?.percentage || 0}%`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Member activity
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <>
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {`+${(membershipData.totalMembers ?? 0) > 0 ? (((membershipData.newMembers ?? 0) / (membershipData.totalMembers ?? 1)) * 100).toFixed(1) : 0}%`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          In selected period
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Analytics */}
              <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="growth">Growth Trends</TabsTrigger>
                  <TabsTrigger value="demographics">Demographics</TabsTrigger>
                  <TabsTrigger value="status">Member Status</TabsTrigger>
                </TabsList>

                <TabsContent value="growth" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Membership Growth</CardTitle>
                      <CardDescription>
                        Track membership growth over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        {loading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-muted-foreground">Loading chart data...</div>
                          </div>
                        ) : (
                          <AreaChart data={membershipData.monthlyGrowth ?? []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Area 
                              type="monotone" 
                              dataKey="members" 
                              stroke="#8884d8" 
                              fill="#8884d8" 
                              fillOpacity={0.6}
                            />
                          </AreaChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>New vs Inactive Members</CardTitle>
                        <CardDescription>
                          Monthly comparison of new and inactive members
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          {loading ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-muted-foreground">Loading chart data...</div>
                            </div>
                          ) : (
                            <BarChart data={membershipData.monthlyGrowth ?? []}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="newMembers" fill="#82ca9d" name="New Members" />
                              <Bar dataKey="inactiveMembers" fill="#ff7300" name="Inactive Members" />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Growth Rate</CardTitle>
                        <CardDescription>
                          Percentage growth month over month
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {loading ? (
                            <div className="text-center text-muted-foreground">Loading growth data...</div>
                          ) : (
                            membershipData.monthlyGrowth?.length ? membershipData.monthlyGrowth.map((data, index) => {
                              const prevMonth = index > 0 ? membershipData.monthlyGrowth?.[index - 1]?.members ?? 0 : data?.members ?? 0;
                              const growthRate = (((data?.members ?? 0) - prevMonth) / (prevMonth || 1) * 100).toFixed(1);
                              return (
                                <div key={data?.month ?? index} className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{data?.month ?? 'Unknown'}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">{data?.members ?? 0} members</span>
                                    <Badge variant={parseFloat(growthRate) > 0 ? "default" : "secondary"}>
                                      {index > 0 ? `${growthRate}%` : "--"}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            }) : (
                              <div className="text-center py-4 text-muted-foreground">No monthly growth data available</div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="demographics" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Age Distribution</CardTitle>
                        <CardDescription>
                          Breakdown of members by age groups
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          {loading ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-muted-foreground">Loading chart data...</div>
                            </div>
                          ) : (
                            <RechartsPieChart>
                              <Pie
                                data={membershipData.ageDistribution ?? []}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, value }) => `${name || 'Unknown'}: ${value || 0}%`}
                              >
                                {membershipData.ageDistribution?.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry?.color ?? `#${(index * 4 + 5).toString(16).padStart(6, '0')}`} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          )}
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Demographic Summary</CardTitle>
                        <CardDescription>
                          Key demographic insights
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {loading ? (
                            <div className="text-center text-muted-foreground">Loading demographic data...</div>
                          ) : (
                            membershipData.ageDistribution?.length ? membershipData.ageDistribution.map((group, index) => (
                              <div key={group?.name ?? index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{group?.name ?? 'Unknown'} years</span>
                                  <span className="text-sm text-muted-foreground">{group?.value ?? 0}%</span>
                                </div>
                                <Progress value={group?.value ?? 0} className="h-2" />
                              </div>
                            )) : (
                              <div className="text-center py-4 text-muted-foreground">No age distribution data available</div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="status" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Member Status Breakdown</CardTitle>
                      <CardDescription>
                        Current status of all church members
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Count</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Trend</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                Loading membership data...
                              </TableCell>
                            </TableRow>
                          ) : (
                            membershipData.membershipByStatus?.length ? membershipData.membershipByStatus.map((status, index) => (
                              <TableRow key={status?.status ?? index}>
                                <TableCell className="font-medium">
                                  <Badge variant={status?.status === "Active" ? "default" : "secondary"}>
                                    {status?.status ?? 'Unknown'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{status?.count ?? 0}</TableCell>
                                <TableCell>{status?.percentage ?? 0}%</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-1">
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                    <span className="text-xs text-green-600">+2%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4">No membership status data available</TableCell>
                              </TableRow>
                            )
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
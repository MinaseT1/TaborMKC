"use client";

import { useState } from "react";
import { Users, Plus, Search, Filter, MoreHorizontal, Mail, Phone, Crown } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Ministry leaders will be loaded from database
const ministryLeaders: Array<Record<string, unknown>> = [];

export default function MinistryLeadersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeaders = ministryLeaders.filter((leader) => {
    const matchesSearch = leader.name?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leader.ministry?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
                  <h2 className="text-3xl font-bold tracking-tight">Ministry Leaders</h2>
                  <p className="text-muted-foreground">
                    Manage ministry leaders and their responsibilities
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Leader
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leaders</CardTitle>
                    <Crown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Ready to assign leaders
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Leaders</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Currently serving
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ministries Led</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Under leadership
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Recently appointed
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leaders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>

              {/* Leaders Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Ministry Leaders</CardTitle>
                  <CardDescription>
                    A list of all ministry leaders and their current assignments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Leader</TableHead>
                        <TableHead>Ministry</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <Crown className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No ministry leaders found</p>
                              <p className="text-sm text-muted-foreground">
                                Start by appointing your first ministry leader
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeaders.map((leader) => (
                          <TableRow key={leader.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={leader.avatar} />
                                  <AvatarFallback>{leader.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{leader.name}</div>
                                  <div className="text-sm text-muted-foreground">{leader.role}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{leader.ministry}</TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{leader.email}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{leader.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={leader.status === "Active" ? "default" : "secondary"}>
                                {leader.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{leader.startDate}</TableCell>
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
                                  <DropdownMenuItem>View details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit leader</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Change ministry</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    Remove leader
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
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
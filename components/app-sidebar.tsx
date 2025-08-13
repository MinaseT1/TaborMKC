"use client"

import * as React from "react"
import Image from "next/image"
import {
  Users,
  UserPlus,
  BarChart3,
  Settings,
  FileText,
  Heart,
  Phone,
  Church,
  MapPin,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Church management data
const data = {
  user: {
    name: "Church Admin",
    email: "admin@mkc.org",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Members",
      url: "/members",
      icon: Users,
      isActive: true,
    },
    {
      title: "Registration",
      url: "/registration",
      icon: UserPlus,
      items: [
        {
          title: "New Members",
          url: "/registration",
        },
        {
          title: "New Ministries",
          url: "/registration/ministries",
        },
      ],
    },
    {
      title: "Ministries",
      url: "/ministries",
      icon: Heart,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
      items: [
        {
          title: "Membership Stats",
          url: "/reports/membership",
        },
        {
          title: "Ministry Reports",
          url: "/reports/ministry",
        },
        {
          title: "Zone Reports",
          url: "/reports/zones",
        },
      ],
    },
    {
      title: "Pastoral Department",
      url: "/pastoral",
      icon: Church,
      items: [
        {
          title: "Zones",
          url: "/pastoral/zones",
          icon: MapPin,
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <Image 
              src="/MKC-Logo.png" 
              alt="MKC Logo" 
              width={32} 
              height={32} 
              className="object-contain"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Meserete Kristos Church</span>
            <span className="truncate text-xs text-muted-foreground">Management System</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

"use client"

import { Users, UserPlus } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"

export function SectionCards() {
  const { stats, loading, error } = useDashboardStats()

  const cardData = [
    {
      title: "Total Members",
      value: stats.totalMembers.toString(),
      description: stats.totalMembers > 0 ? "Active church members" : "Ready to start counting",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "New Registrations",
      value: stats.recentRegistrations.toString(),
      description: stats.recentRegistrations > 0 ? "New members this month" : "Awaiting new members",
      trend: "up",
      icon: UserPlus,
      color: "text-green-600",
    },


  ]

  if (error) {
    return (
      <div className="grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="col-span-full text-center text-red-500 p-4">
          {error} - Showing cached data
        </div>
        {cardData.map((item, index) => {
          const IconComponent = item.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {cardData.map((item, index) => {
        const IconComponent = item.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <IconComponent className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

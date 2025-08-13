import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all the statistics in parallel for better performance
    const [totalMembers, totalMinistries, recentRegistrations] = await Promise.all([
      // Total members count
      prisma.member.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // Total ministries count
      prisma.ministry.count({
        where: {
          isActive: true
        }
      }),
      

      
      // Recent registrations (last 30 days)
      prisma.member.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          },
          status: 'ACTIVE'
        }
      })
    ])

    const stats = {
      totalMembers,
      totalMinistries,
      upcomingEvents: 0,
      recentRegistrations
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error: unknown) {
    console.error('Error fetching dashboard stats:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard statistics',
        stats: {
          totalMembers: 0,
          totalMinistries: 0,
          upcomingEvents: 0,
          recentRegistrations: 0
        }
      },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'membership'
    const period = searchParams.get('period') || '1month'

    const data: Record<string, unknown> = {}
    
    // Calculate date range based on period
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '1month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(endDate.getMonth() - 1)
    }

    switch (type) {
      case 'membership':
        // For membership, nest the data in a membership property to match frontend expectations
        data.membership = await getMembershipStats(startDate, endDate)
        break

      case 'ministry':
        // Use real ministry stats instead of sample data
        data.ministry = await getMinistryStats(startDate, endDate)
        break

      case 'zones':
        // Zone reports data
        data.zones = await getZoneStats(startDate, endDate)
        break

      default:
        // For default case (membership), also nest the data in a membership property
        data.membership = await getMembershipStats(startDate, endDate)
        break
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating report data:', error)
    return NextResponse.json(
      { error: 'Failed to generate report data' },
      { status: 500 }
    )
  }
}











async function getMembershipStats(startDate: Date, endDate: Date) {
  try {
    // Get total members
    const totalMembers = await prisma.member.count({
      where: { status: 'ACTIVE' }
    });

    // Get new members in period
    const newMembers = await prisma.member.count({
      where: {
        status: 'ACTIVE',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get members by age groups
    const allMembers = await prisma.member.findMany({
      where: { status: 'ACTIVE' },
      select: { dateOfBirth: true, createdAt: true }
    });

    // Get members by status
    const activeMembers = await prisma.member.count({
      where: { status: 'ACTIVE' }
    });
    
    const inactiveMembers = await prisma.member.count({
      where: { status: 'INACTIVE' }
    });
    
    const transferredMembers = await prisma.member.count({
      where: { status: 'TRANSFERRED' }
    });
    
    const suspendedMembers = await prisma.member.count({
      where: { status: 'SUSPENDED' }
    });
    
    // Calculate total for percentages
    const totalForPercentage = activeMembers + inactiveMembers + transferredMembers + suspendedMembers;
    
    // Calculate membership by status with real percentages
    const membershipByStatus = [
      { 
        status: 'Active', 
        count: activeMembers, 
        percentage: totalForPercentage > 0 ? Math.round((activeMembers / totalForPercentage) * 100) : 0 
      },
      { 
        status: 'Inactive', 
        count: inactiveMembers, 
        percentage: totalForPercentage > 0 ? Math.round((inactiveMembers / totalForPercentage) * 100) : 0 
      },
      { 
        status: 'Transferred', 
        count: transferredMembers, 
        percentage: totalForPercentage > 0 ? Math.round((transferredMembers / totalForPercentage) * 100) : 0 
      },
      { 
        status: 'Suspended', 
        count: suspendedMembers, 
        percentage: totalForPercentage > 0 ? Math.round((suspendedMembers / totalForPercentage) * 100) : 0 
      }
    ];

    const ageDistribution = calculateAgeDistribution(allMembers);
    const monthlyGrowth = await calculateMonthlyGrowth(startDate, endDate);
    
    // Calculate growth rate
    const previousMembers = totalMembers - newMembers;
    const growthRate = previousMembers > 0 ? parseFloat(((newMembers / previousMembers) * 100).toFixed(1)) : 0;

    return {
      totalMembers,
      newMembers,
      growthRate,
      activeRate: totalForPercentage > 0 ? Math.round((activeMembers / totalForPercentage) * 100) : 0,
      ageDistribution,
      monthlyGrowth,
      membershipByStatus
    };
  } catch (error) {
    console.error('Error in getMembershipStats:', error);
    throw error;
  }
}





async function getMinistryStats(startDate: Date, endDate: Date) {
  try {
    // Get all ministries with their member counts
    const ministries = await prisma.ministry.findMany({
      where: { isActive: true },
      include: {
        members: {
          where: { isActive: true },
          include: {
            member: {
              select: {
                status: true,
                createdAt: true
              }
            }
          }
        }
      }
    });

    // Calculate ministry participation data
    const ministryParticipation = ministries.map(ministry => {
      const totalMembers = ministry.members.length;
      const activeMembers = ministry.members.filter(mm => 
        mm.member.status === 'ACTIVE'
      ).length;
      const percentage = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
      
      return {
        ministry: ministry.name,
        members: totalMembers,
        active: activeMembers,
        percentage
      };
    });

    // Calculate totals
    const totalMinistries = ministries.length;
    const totalParticipants = ministries.reduce((sum, ministry) => sum + ministry.members.length, 0);
    const activeMembers = ministries.reduce((sum, ministry) => 
      sum + ministry.members.filter(mm => mm.member.status === 'ACTIVE').length, 0
    );
    const participationRate = totalParticipants > 0 ? Math.round((activeMembers / totalParticipants) * 100) : 0;

    // Calculate monthly growth (new ministry members in the period)
    const newMembersInPeriod = ministries.reduce((sum, ministry) => {
      const newMembers = ministry.members.filter(mm => 
        mm.createdAt >= startDate && mm.createdAt <= endDate
      ).length;
      return sum + newMembers;
    }, 0);
    
    const previousMembers = totalParticipants - newMembersInPeriod;
    const monthlyGrowth = previousMembers > 0 ? parseFloat(((newMembersInPeriod / previousMembers) * 100).toFixed(1)) : 0;

    // Generate ministry stats for detailed view
    const ministryStats = ministries.map(ministry => {
      const totalMembers = ministry.members.length;
      const leaders = ministry.members.filter(mm => 
        mm.role && mm.role.toLowerCase().includes('leader')
      ).length;
      
      // Calculate growth for this ministry
      const newMembers = ministry.members.filter(mm => 
        mm.createdAt >= startDate && mm.createdAt <= endDate
      ).length;
      const previousTotal = totalMembers - newMembers;
      const growth = previousTotal > 0 ? parseFloat(((newMembers / previousTotal) * 100).toFixed(1)) : 0;
      
      return {
        name: ministry.name,
        members: totalMembers,
        leaders: leaders || 1, // At least 1 leader assumed
        activities: 4, // Default activities count
        growth
      };
    });

    // Generate participation trends (simplified for now)
    const participationTrends = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      
      const monthlyParticipation = await prisma.memberMinistry.count({
        where: {
          isActive: true,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });
      
      participationTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        participation: monthlyParticipation,
        // Removed events data
      });
      
      current.setMonth(current.getMonth() + 1);
    }

    // Generate leadership data
    const leadershipData = ministries.map(ministry => {
      const totalMembers = ministry.members.length;
      const leaders = ministry.members.filter(mm => 
        mm.role && mm.role.toLowerCase().includes('leader')
      ).length || 1;
      const ratio = totalMembers > 0 ? parseFloat((totalMembers / leaders).toFixed(1)) : 0;
      
      return {
        ministry: ministry.name,
        leaders,
        members: totalMembers,
        ratio
      };
    });

    return {
      totalMinistries,
      activeMembers,
      participationRate,
      monthlyGrowth,
      ministryStats,
      participationTrends,
      leadershipData,
      ministryParticipation // Keep this for backward compatibility
    };
  } catch (error) {
    console.error('Error in getMinistryStats:', error);
    throw error;
  }
}

async function getAllReportsData(startDate: Date, endDate: Date) {
  try {
    const [membershipStats, ministryStats] = await Promise.all([
      getMembershipStats(startDate, endDate),
      getMinistryStats(startDate, endDate)
    ]);

    return {
      membership: membershipStats,
      ministry: ministryStats
    };
  } catch (error) {
    console.error('Error in getAllReportsData:', error);
    throw error;
  }
}

function calculateAgeDistribution(members: { dateOfBirth: Date | null }[]) {
  const ageGroups = {
    '0-18': 0,
    '19-35': 0,
    '36-50': 0,
    '51+': 0
  };

  const now = new Date();
  
  members.forEach(member => {
    if (member.dateOfBirth) {
      const age = now.getFullYear() - member.dateOfBirth.getFullYear();
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else ageGroups['51+']++;
    }
  });

  const total = Object.values(ageGroups).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(ageGroups).map(([name, value]) => ({
    name,
    value: total > 0 ? Math.round((value / total) * 100) : 0,
    color: getColorForAgeGroup(name)
  }));
}

function getColorForAgeGroup(ageGroup: string) {
  const colors: { [key: string]: string } = {
    '0-18': '#8884d8',
    '19-35': '#82ca9d',
    '36-50': '#ffc658',
    '51+': '#ff7300'
  };
  return colors[ageGroup] || '#8884d8';
}

async function calculateMonthlyGrowth(startDate: Date, endDate: Date) {
  const months = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    const newMembers = await prisma.member.count({
      where: {
        status: 'ACTIVE',
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });

    const totalMembers = await prisma.member.count({
      where: {
        status: 'ACTIVE',
        createdAt: {
          lte: monthEnd
        }
      }
    });

    months.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      members: totalMembers,
      newMembers,
      retention: 96 // Sample retention rate
    });

    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

// Sample data generators
function generateMembershipData(period: string) {
  const totalMembers = 255
  const newMembers = period === '1month' ? 12 : period === '3months' ? 35 : period === '6months' ? 68 : 125
  const activeRate = 87.3
  const growthRate = ((newMembers / (totalMembers - newMembers)) * 100).toFixed(1)

  return {
    totalMembers,
    newMembers,
    activeRate,
    growthRate: parseFloat(growthRate),
    monthlyGrowth: [
      { month: 'Jan', members: 180, newMembers: 8, retention: 96.2 },
      { month: 'Feb', members: 195, newMembers: 15, retention: 97.1 },
      { month: 'Mar', members: 210, newMembers: 15, retention: 96.5 },
      { month: 'Apr', members: 225, newMembers: 15, retention: 97.3 },
      { month: 'May', members: 240, newMembers: 15, retention: 96.8 },
      { month: 'Jun', members: 255, newMembers: 15, retention: 97.2 }
    ],
    ageDistribution: [
      { name: '18-25', value: 18, color: '#8884d8' },
      { name: '26-35', value: 27, color: '#83a6ed' },
      { name: '36-45', value: 28, color: '#8dd1e1' },
      { name: '46-55', value: 16, color: '#82ca9d' },
      { name: '56+', value: 11, color: '#a4de6c' }
    ],
    membershipByStatus: [
      { status: 'Active', count: 223, percentage: 87.5 },
      { status: 'Inactive', count: 22, percentage: 8.6 },
      { status: 'New', count: 10, percentage: 3.9 }
    ]
  }
}

function generateGrowthData(period: string) {
  const totalMembers = 255
  const newMembersThisYear = 75
  const growthRate = 8.5

  return {
    totalMembers,
    newMembersThisYear,
    growthRate,
    monthlyGrowth: [
      { month: 'Jan', members: 180, newMembers: 8, retention: 96.2 },
      { month: 'Feb', members: 195, newMembers: 15, retention: 95.8 },
      { month: 'Mar', members: 210, newMembers: 15, retention: 96.5 },
      { month: 'Apr', members: 225, newMembers: 15, retention: 97.1 },
      { month: 'May', members: 240, newMembers: 15, retention: 96.8 },
      { month: 'Jun', members: 255, newMembers: 15, retention: 97.2 }
    ],
    growthTargets: [
      { category: 'Total Membership', current: 255, target: 300, percentage: 85 },
      { category: 'Youth Ministry', current: 45, target: 60, percentage: 75 },
      { category: 'New Members', current: 75, target: 100, percentage: 75 },
      { category: 'Active Participation', current: 223, target: 250, percentage: 89 }
    ]
  }
}



function generateMinistryData(period: string) {
  return {
    totalMinistries: 12,
    activeMembers: 187,
    participationRate: 73.3,
    monthlyGrowth: 8.4,
    ministryStats: [
      { name: 'Worship Team', members: 25, leaders: 3, activities: 8, growth: 12.5 },
      { name: 'Youth Ministry', members: 45, leaders: 5, activities: 12, growth: 15.2 },
      { name: 'Children Ministry', members: 32, leaders: 4, activities: 10, growth: 8.7 },
      { name: 'Outreach', members: 28, leaders: 3, activities: 6, growth: 22.1 },
      { name: 'Prayer Team', members: 18, leaders: 2, activities: 4, growth: 5.8 },
      { name: 'Media Team', members: 15, leaders: 2, activities: 8, growth: 33.3 }
    ],
    participationTrends: [
      { month: 'Jan', participation: 165 },
      { month: 'Feb', participation: 172 },
      { month: 'Mar', participation: 180 },
      { month: 'Apr', participation: 187 }
    ],
    leadershipData: [
      { ministry: 'Worship Team', leaders: 3, members: 25, ratio: 8.3 },
      { ministry: 'Youth Ministry', leaders: 5, members: 45, ratio: 9.0 },
      { ministry: 'Children Ministry', leaders: 4, members: 32, ratio: 8.0 },
      { ministry: 'Outreach', leaders: 3, members: 28, ratio: 9.3 }
    ]
  }
}

async function getZoneStats(startDate: Date, endDate: Date) {
  try {
    // Get all zones with their current member counts
    const zones = await prisma.zone.findMany({
      where: {
        isActive: true
      },
      include: {
        members: {
          where: {
            status: 'ACTIVE'
          }
        },
        _count: {
          select: {
            members: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    })

    // Calculate total members across all zones
    const totalMembers = zones.reduce((sum, zone) => sum + zone._count.members, 0)
    const totalZones = zones.length
    const averageMembersPerZone = totalZones > 0 ? Math.round(totalMembers / totalZones) : 0

    // Calculate real monthly growth
    const previousMonthStart = new Date(startDate)
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1)
    const previousMonthEnd = new Date(startDate)
    
    const currentPeriodMembers = await prisma.member.count({
      where: {
        status: 'ACTIVE',
        zoneId: { not: null },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })
    
    const previousPeriodMembers = await prisma.member.count({
      where: {
        status: 'ACTIVE',
        zoneId: { not: null },
        createdAt: {
          gte: previousMonthStart,
          lt: startDate
        }
      }
    })
    
    const monthlyGrowth = previousPeriodMembers > 0 
      ? Math.round(((currentPeriodMembers - previousPeriodMembers) / previousPeriodMembers) * 100)
      : 0

    // Calculate real zone statistics with growth
    const zoneStatsPromises = zones.map(async (zone) => {
      // Get current members count
      const currentMembers = zone._count.members
      
      // Get previous period members count for this zone
      const previousMembers = await prisma.member.count({
        where: {
          status: 'ACTIVE',
          zoneId: zone.id,
          createdAt: {
            lt: startDate
          }
        }
      })
      
      // Calculate growth for this zone
      const growth = previousMembers > 0 
        ? Math.round(((currentMembers - previousMembers) / previousMembers) * 100)
        : currentMembers > 0 ? 100 : 0
      
      return {
        name: zone.name,
        members: currentMembers,
        leaderName: zone.leaderName,
        growth,
        isActive: zone.isActive
      }
    })
    
    const zoneStats = await Promise.all(zoneStatsPromises)

    // Generate real membership trends over the last 6 months
    const membershipTrends = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      const monthMembers = await prisma.member.count({
        where: {
          status: 'ACTIVE',
          zoneId: { not: null },
          createdAt: {
            lte: monthEnd
          }
        }
      })
      
      membershipTrends.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        members: monthMembers
      })
    }

    // Calculate zone distribution
    const zoneDistribution = zones.map(zone => ({
      zone: zone.name,
      members: zone._count.members,
      percentage: totalMembers > 0 ? Math.round((zone._count.members / totalMembers) * 100) : 0
    }))

    return {
      totalZones,
      totalMembers,
      averageMembersPerZone,
      monthlyGrowth,
      zoneStats,
      membershipTrends,
      zoneDistribution
    }
  } catch (error) {
    console.error('Error fetching zone stats:', error)
    return {
      totalZones: 0,
      totalMembers: 0,
      averageMembersPerZone: 0,
      monthlyGrowth: 0,
      zoneStats: [],
      membershipTrends: [],
      zoneDistribution: []
    }
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  description: z.string().optional(),
  leaderName: z.string().optional(),
  notes: z.string().optional(),
})

const updateZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required').optional(),
  description: z.string().optional(),
  leaderName: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/zones - Get all zones
export async function GET() {
  try {
    const zones = await prisma.zone.findMany({
      include: {
        saleGroups: {
          select: {
            id: true,
            name: true,
            leaderName: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        _count: {
          select: {
            saleGroups: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const zonesWithSaleGroupCount = zones.map(zone => ({
      ...zone,
      saleGroupCount: zone._count.saleGroups,
      saleGroups: zone.saleGroups.map(group => ({
        ...group,
        memberCount: group._count.members,
      })),
    }))

    return NextResponse.json({ zones: zonesWithSaleGroupCount })
  } catch (error) {
    console.error('Error fetching zones:', error)
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    )
  }
}

// POST /api/zones - Create a new zone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createZoneSchema.parse(body)

    // Check if zone name already exists
    const existingZone = await prisma.zone.findUnique({
      where: { name: validatedData.name },
    })

    if (existingZone) {
      return NextResponse.json(
        { error: 'Zone with this name already exists' },
        { status: 400 }
      )
    }

    // Convert empty leaderName to null
    if (validatedData.leaderName === '') {
      validatedData.leaderName = null
    }

    const zone = await prisma.zone.create({
      data: validatedData,
      include: {
        saleGroups: {
          select: {
            id: true,
            name: true,
            leaderName: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        _count: {
          select: {
            saleGroups: true,
          },
        },
      },
    })

    const totalMemberCount = zone.saleGroups.reduce((total, group) => total + group._count.members, 0)

    return NextResponse.json(
      {
        ...zone,
        memberCount: totalMemberCount,
        saleGroupCount: zone._count.saleGroups,
        saleGroups: zone.saleGroups.map(group => ({
          ...group,
          memberCount: group._count.members,
        })),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating zone:', error)
    return NextResponse.json(
      { error: 'Failed to create zone' },
      { status: 500 }
    )
  }
}
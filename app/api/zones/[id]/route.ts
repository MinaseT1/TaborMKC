import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required').optional(),
  description: z.string().optional(),
  leaderName: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/zones/[id] - Get a specific zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const zone = await prisma.zone.findUnique({
      where: { id },
      include: {
        saleGroups: {
          select: {
            id: true,
            name: true,
            leaderName: true,
            members: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
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

    if (!zone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      )
    }

    const totalMemberCount = zone.saleGroups.reduce((total, group) => total + group._count.members, 0)
    const allMembers = zone.saleGroups.flatMap(group => group.members)

    return NextResponse.json({
      ...zone,
      memberCount: totalMemberCount,
      saleGroupCount: zone._count.saleGroups,
      members: allMembers,
      saleGroups: zone.saleGroups.map(group => ({
        ...group,
        memberCount: group._count.members,
      })),
    })
  } catch (error) {
    console.error('Error fetching zone:', error)
    return NextResponse.json(
      { error: 'Failed to fetch zone' },
      { status: 500 }
    )
  }
}

// PUT /api/zones/[id] - Update a zone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateZoneSchema.parse(body)

    // Check if zone exists
    const existingZone = await prisma.zone.findUnique({
      where: { id },
    })

    if (!existingZone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      )
    }

    // If name is being updated, check for duplicates
    if (validatedData.name && validatedData.name !== existingZone.name) {
      const duplicateZone = await prisma.zone.findUnique({
        where: { name: validatedData.name },
      })

      if (duplicateZone) {
        return NextResponse.json(
          { error: 'Zone with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Convert empty leaderName to null
    if (validatedData.leaderName === '') {
      validatedData.leaderName = null
    }

    const updatedZone = await prisma.zone.update({
      where: { id },
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

    // Get leader information
    let leader = null
    if (updatedZone.leaderId) {
      leader = await prisma.member.findUnique({
        where: { id: updatedZone.leaderId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      })
    }

    const totalMemberCount = updatedZone.saleGroups.reduce((total, group) => total + group._count.members, 0)

    return NextResponse.json({
      ...updatedZone,
      leader,
      memberCount: totalMemberCount,
      saleGroupCount: updatedZone._count.saleGroups,
      saleGroups: updatedZone.saleGroups.map(group => ({
        ...group,
        memberCount: group._count.members,
      })),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating zone:', error)
    return NextResponse.json(
      { error: 'Failed to update zone' },
      { status: 500 }
    )
  }
}

// DELETE /api/zones/[id] - Delete a zone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if zone exists
    const existingZone = await prisma.zone.findUnique({
      where: { id },
      include: {
        saleGroups: {
          include: {
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

    if (!existingZone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      )
    }

    // Check if zone has sale groups
    if (existingZone._count.saleGroups > 0) {
      return NextResponse.json(
        { error: 'Cannot delete zone with sale groups. Please delete sale groups first.' },
        { status: 400 }
      )
    }

    // Additional check for any members in sale groups
    const totalMembers = existingZone.saleGroups.reduce((total, group) => total + group._count.members, 0)
    if (totalMembers > 0) {
      return NextResponse.json(
        { error: 'Cannot delete zone with members. Please reassign members first.' },
        { status: 400 }
      )
    }

    await prisma.zone.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Zone deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting zone:', error)
    return NextResponse.json(
      { error: 'Failed to delete zone' },
      { status: 500 }
    )
  }
}
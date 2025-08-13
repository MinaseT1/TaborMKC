import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/prisma'

// GET - Get all members of a specific ministry
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {

    // Get all members of this ministry directly without checking ministry existence first
    // This reduces the number of database calls and potential connection issues
    const ministryMembers = await prisma.memberMinistry.findMany({
      where: {
        ministryId: id,
        isActive: true
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true
          }
        }
      }
    })

    // Transform the data to include member information with join date
    const members = ministryMembers.map(mm => ({
      ...mm.member,
      joinDate: mm.joinedAt,
      role: mm.role
    }))

    return NextResponse.json({
      success: true,
      members,
      total: members.length
    })

  } catch (error: unknown) {
    console.error('Error fetching ministry members:', error)
    
    const errorResponse = handlePrismaError(error)
    if (errorResponse.error) {
      return NextResponse.json(errorResponse, { status: 500 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch ministry members' },
      { status: 500 }
    )
  }
}

// POST - Add a member to a ministry
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Check if ministry exists
    const ministry = await prisma.ministry.findUnique({
      where: { id }
    })

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministry not found' },
        { status: 404 }
      )
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Check if member is already in this ministry
    const existingRelation = await prisma.memberMinistry.findFirst({
      where: {
        memberId,
        ministryId: id,
        isActive: true
      }
    })

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Member is already in this ministry' },
        { status: 400 }
      )
    }

    // Add member to ministry
    const memberMinistry = await prisma.memberMinistry.create({
      data: {
        memberId,
        ministryId: id,
        role: 'MEMBER',
        joinedAt: new Date(),
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      memberMinistry,
      message: 'Member added to ministry successfully'
    })

  } catch (error: unknown) {
    console.error('Error adding member to ministry:', error)
    
    const errorResponse = handlePrismaError(error)
    if (errorResponse.error) {
      return NextResponse.json(errorResponse, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to add member to ministry. Please try again.' },
      { status: 500 }
    )
  }
}
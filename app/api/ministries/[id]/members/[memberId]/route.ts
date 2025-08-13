import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/prisma'

// DELETE - Remove a member from a ministry
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { id: ministryId, memberId } = params

    // Check if ministry exists
    const ministry = await prisma.ministry.findUnique({
      where: { id: ministryId }
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

    // Find the member-ministry relationship
    const memberMinistry = await prisma.memberMinistry.findFirst({
      where: {
        memberId,
        ministryId,
        isActive: true
      }
    })

    if (!memberMinistry) {
      return NextResponse.json(
        { error: 'Member is not in this ministry' },
        { status: 400 }
      )
    }

    // Remove member from ministry (soft delete by setting isActive to false)
    await prisma.memberMinistry.update({
      where: { id: memberMinistry.id },
      data: {
        isActive: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Member removed from ministry successfully'
    })

  } catch (error: unknown) {
    console.error('Error removing member from ministry:', error)
    
    const errorResponse = handlePrismaError(error)
    if (errorResponse.error) {
      return NextResponse.json(errorResponse, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to remove member from ministry. Please try again.' },
      { status: 500 }
    )
  }
}

// GET - Get specific member details in a ministry
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { id: ministryId, memberId } = params

    // Get the member-ministry relationship with details
    const memberMinistry = await prisma.memberMinistry.findFirst({
      where: {
        memberId,
        ministryId,
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
            isActive: true
          }
        },
        ministry: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!memberMinistry) {
      return NextResponse.json(
        { error: 'Member not found in this ministry' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      memberMinistry
    })

  } catch (error: unknown) {
    console.error('Error fetching member ministry details:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch member ministry details' },
      { status: 500 }
    )
  }
}
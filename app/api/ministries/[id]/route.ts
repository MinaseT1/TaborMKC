import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/prisma'

// PUT - Update a ministry
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()
    
    const {
      name,
      description,
      meetingDay,
      meetingTime,
      location,
      capacity,
      isActive,
      notes
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Update the ministry
    const updatedMinistry = await prisma.ministry.update({
      where: { id },
      data: {
        name,
        description: description || null,
        meetingDay: meetingDay || null,
        meetingTime: meetingTime || null,
        location: location || null,
        capacity: capacity ? parseInt(capacity) : null,
        isActive: isActive !== undefined ? isActive : true,
        notes: notes || null
      },
      include: {
        _count: {
          select: {
            members: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      ministry: updatedMinistry,
      message: 'Ministry updated successfully'
    })

  } catch (error: unknown) {
    console.error('Ministry update error:', error)
    
    const errorResponse = handlePrismaError(error)
    if (errorResponse.error) {
      return NextResponse.json(errorResponse, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update ministry. Please try again.' },
      { status: 500 }
    )
  }
}

// GET - Get a specific ministry
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {

    const ministry = await prisma.ministry.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    })

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministry not found' },
        { status: 404 }
      )
    }

    // Extract leader information from notes
    const leaders: string[] = []
    
    if (ministry.notes) {
      const lines = ministry.notes.split('\n')
      lines.forEach(line => {
        if (line.startsWith('Leader: ')) {
          const leaderName = line.replace('Leader: ', '').trim()
          if (leaderName && !leaders.includes(leaderName)) {
            leaders.push(leaderName)
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      ministry: {
        ...ministry,
        leaders
      }
    })

  } catch (error: unknown) {
    console.error('Error fetching ministry:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch ministry' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a ministry
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {

    // First, remove all member-ministry relationships
    await prisma.memberMinistry.deleteMany({
      where: { ministryId: id }
    })

    // Then delete the ministry
    await prisma.ministry.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Ministry deleted successfully'
    })

  } catch (error: unknown) {
    console.error('Ministry deletion error:', error)
    
    const errorResponse = handlePrismaError(error)
    if (errorResponse.error) {
      return NextResponse.json(errorResponse, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to delete ministry. Please try again.' },
      { status: 500 }
    )
  }
}
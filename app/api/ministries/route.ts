import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      description,
      leader,
      leaders,
      meetingDay,
      meetingTime,
      location,
      capacity,
      isActive,
      requirements,
      contactEmail,
      contactPhone
    } = body

    // Use leaders array if available, otherwise fall back to single leader
    const leadersList = leaders && Array.isArray(leaders) ? leaders : (leader ? [leader] : [])
    const filteredLeaders = leadersList.filter((l: string) => l && l.trim())

    // Validate required fields
    if (!name || filteredLeaders.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one leader are required fields' },
        { status: 400 }
      )
    }

    // Prepare notes with requirements and contact info
    const notesData = []
    if (requirements?.trim()) {
      notesData.push(`Requirements: ${requirements.trim()}`)
    }
    if (contactEmail?.trim()) {
      notesData.push(`Contact Email: ${contactEmail.trim()}`)
    }
    if (contactPhone?.trim()) {
      notesData.push(`Contact Phone: ${contactPhone.trim()}`)
    }
    // Add each leader as a separate line
    filteredLeaders.forEach((leaderName: string) => {
      if (leaderName.trim()) {
        notesData.push(`Leader: ${leaderName.trim()}`)
      }
    })

    // Create the ministry in the database
    const ministry = await prisma.ministry.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        meetingDay: meetingDay || null,
        meetingTime: meetingTime || null,
        location: location?.trim() || null,
        capacity: capacity ? parseInt(capacity) : null,
        isActive: isActive ?? true,
        notes: notesData.length > 0 ? notesData.join('\n') : null,
        // For now, we'll set leaderId to null since we don't have user management
        // In a real app, you'd look up the leader by name/email
        leaderId: null
      }
    })

    return NextResponse.json({
      success: true,
      ministry,
      message: 'Ministry registered successfully!'
    })

  } catch (error: unknown) {
    console.error('Ministry registration error:', error)
    
    const errorResponse = handlePrismaError(error)
    if (errorResponse.error) {
      return NextResponse.json(errorResponse, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to register ministry. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const ministries = await prisma.ministry.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        meetingDay: true,
        meetingTime: true,
        location: true,
        capacity: true,
        isActive: true,
        createdAt: true,
        leaderId: true,
        notes: true,
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

    // Extract leader information from notes
    const ministriesWithLeaders = ministries.map(ministry => {
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
      
      return {
        ...ministry,
        leaders
      }
    })

    return NextResponse.json({
      success: true,
      ministries: ministriesWithLeaders,
      total: ministriesWithLeaders.length
    })

  } catch (error: unknown) {
    console.error('Error fetching ministries:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch ministries' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/prisma'

// GET - Fetch all church settings
export async function GET() {
  try {
    const settings = await prisma.churchSettings.findMany({
      orderBy: {
        category: 'asc'
      }
    })

    // Convert to key-value object for easier frontend consumption
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        category: setting.category,
        description: setting.description,
        isPublic: setting.isPublic,
        id: setting.id
      }
      return acc
    }, {} as Record<string, unknown>)

    return NextResponse.json({
      success: true,
      settings: settingsObject,
      total: settings.length
    })

  } catch (error: unknown) {
    console.error('Error fetching church settings:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch church settings' },
      { status: 500 }
    )
  }
}

// POST - Create or update church settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      )
    }

    const updatedSettings = []

    // Process each setting
    for (const [key, data] of Object.entries(settings)) {
      const settingData = data as Record<string, unknown>
      
      const setting = await prisma.churchSettings.upsert({
        where: { key },
        update: {
          value: String(settingData.value || ''),
          category: settingData.category || 'general',
          description: settingData.description || null,
          isPublic: settingData.isPublic || false
        },
        create: {
          key,
          value: String(settingData.value || ''),
          category: settingData.category || 'general',
          description: settingData.description || null,
          isPublic: settingData.isPublic || false
        }
      })

      updatedSettings.push(setting)
    }

    return NextResponse.json({
      success: true,
      message: 'Church settings updated successfully',
      updatedCount: updatedSettings.length
    })

  } catch (error: unknown) {
    console.error('Church settings update error:', error)
    
    const errorResponse = handlePrismaError(error)
    if (errorResponse.error) {
      return NextResponse.json(errorResponse, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update church settings. Please try again.' },
      { status: 500 }
    )
  }
}

// PUT - Update a specific setting
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, category, description, isPublic } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }

    const setting = await prisma.churchSettings.upsert({
      where: { key },
      update: {
        value: String(value || ''),
        category: category || 'general',
        description: description || null,
        isPublic: isPublic || false
      },
      create: {
        key,
        value: String(value || ''),
        category: category || 'general',
        description: description || null,
        isPublic: isPublic || false
      }
    })

    return NextResponse.json({
      success: true,
      setting,
      message: 'Setting updated successfully'
    })

  } catch (error: unknown) {
    console.error('Setting update error:', error)
    
    const errorResponse = handlePrismaError(error)
    if (errorResponse.error) {
      return NextResponse.json(errorResponse, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update setting. Please try again.' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific setting
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }

    await prisma.churchSettings.delete({
      where: { key }
    })

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully'
    })

  } catch (error: unknown) {
    console.error('Setting deletion error:', error)
    
    const errorResponse = handlePrismaError(error)
    if (errorResponse.error) {
      return NextResponse.json(errorResponse, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to delete setting. Please try again.' },
      { status: 500 }
    )
  }
}
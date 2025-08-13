import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');

    let saleGroups;
    
    if (zoneId) {
      // Get sale groups for a specific zone
      saleGroups = await prisma.saleGroup.findMany({
        where: {
          zoneId: zoneId,
          isActive: true
        },
        include: {
          zone: {
            select: {
              id: true,
              name: true
            }
          },
          members: {
            where: {
              status: 'ACTIVE'
            },
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
    } else {
      // Get all sale groups
      saleGroups = await prisma.saleGroup.findMany({
        where: {
          isActive: true
        },
        include: {
          zone: {
            select: {
              id: true,
              name: true
            }
          },
          members: {
            where: {
              status: 'ACTIVE'
            },
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
    }

    // Add member count to each sale group
    const saleGroupsWithCount = saleGroups.map(group => ({
      ...group,
      memberCount: group.members.length
    }));

    return NextResponse.json({ saleGroups: saleGroupsWithCount });
  } catch (error) {
    console.error('Error fetching sale groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sale groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, leaderName, zoneId, notes } = body;

    // Validate required fields
    if (!name || !leaderName || !zoneId) {
      return NextResponse.json(
        { error: 'Name, leader name, and zone ID are required' },
        { status: 400 }
      );
    }

    // Check if zone exists
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId }
    });

    if (!zone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      );
    }

    // Check if sale group name already exists in this zone
    const existingSaleGroup = await prisma.saleGroup.findFirst({
      where: {
        name: name,
        zoneId: zoneId
      }
    });

    if (existingSaleGroup) {
      return NextResponse.json(
        { error: 'Sale group with this name already exists in this zone' },
        { status: 400 }
      );
    }

    // Create the sale group
    const saleGroup = await prisma.saleGroup.create({
      data: {
        name,
        leaderName,
        zoneId,
        notes
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true
          }
        },
        members: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const saleGroupWithCount = {
      ...saleGroup,
      memberCount: saleGroup.members.length
    };

    return NextResponse.json(saleGroupWithCount, { status: 201 });
  } catch (error) {
    console.error('Error creating sale group:', error);
    return NextResponse.json(
      { error: 'Failed to create sale group' },
      { status: 500 }
    );
  }
}
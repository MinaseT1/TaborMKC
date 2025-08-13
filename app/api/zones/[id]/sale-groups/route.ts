import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/zones/[id]/sale-groups - Get sale groups for a specific zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: zoneId } = await params;

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

    // Get sale groups for the specific zone
    const saleGroups = await prisma.saleGroup.findMany({
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

    // Add member count to each sale group
    const saleGroupsWithCount = saleGroups.map(group => ({
      ...group,
      memberCount: group.members.length
    }));

    return NextResponse.json({ saleGroups: saleGroupsWithCount });
  } catch (error) {
    console.error('Error fetching sale groups for zone:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sale groups' },
      { status: 500 }
    );
  }
}

// POST /api/zones/[id]/sale-groups - Create a new sale group in the specific zone
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: zoneId } = await params;
    const body = await request.json();
    const { name, leaderName, notes } = body;

    // Validate required fields
    if (!name || !leaderName) {
      return NextResponse.json(
        { error: 'Name and leader name are required' },
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
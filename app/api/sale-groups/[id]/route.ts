import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const saleGroup = await prisma.saleGroup.findUnique({
      where: {
        id
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
            lastName: true,
            email: true,
            phone: true,
            membershipDate: true
          }
        }
      }
    });

    if (!saleGroup) {
      return NextResponse.json(
        { error: 'Sale group not found' },
        { status: 404 }
      );
    }

    const saleGroupWithCount = {
      ...saleGroup,
      memberCount: saleGroup.members.length
    };

    return NextResponse.json(saleGroupWithCount);
  } catch (error) {
    console.error('Error fetching sale group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sale group' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json();
    const { name, leaderName, notes, isActive } = body;

    // Check if sale group exists
    const existingSaleGroup = await prisma.saleGroup.findUnique({
      where: { id }
    });

    if (!existingSaleGroup) {
      return NextResponse.json(
        { error: 'Sale group not found' },
        { status: 404 }
      );
    }

    // If name is being changed, check for duplicates in the same zone
    if (name && name !== existingSaleGroup.name) {
      const duplicateSaleGroup = await prisma.saleGroup.findFirst({
        where: {
          name: name,
          zoneId: existingSaleGroup.zoneId,
          id: { not: id }
        }
      });

      if (duplicateSaleGroup) {
        return NextResponse.json(
          { error: 'Sale group with this name already exists in this zone' },
          { status: 400 }
        );
      }
    }

    // Update the sale group
    const updatedSaleGroup = await prisma.saleGroup.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(leaderName && { leaderName }),
        ...(notes !== undefined && { notes }),
        ...(isActive !== undefined && { isActive })
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
      ...updatedSaleGroup,
      memberCount: updatedSaleGroup.members.length
    };

    return NextResponse.json(saleGroupWithCount);
  } catch (error) {
    console.error('Error updating sale group:', error);
    return NextResponse.json(
      { error: 'Failed to update sale group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if sale group exists
    const saleGroup = await prisma.saleGroup.findUnique({
      where: { id },
      include: {
        members: true
      }
    });

    if (!saleGroup) {
      return NextResponse.json(
        { error: 'Sale group not found' },
        { status: 404 }
      );
    }

    // Check if sale group has members
    if (saleGroup.members.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete sale group with members. Please move members to another sale group first.' },
        { status: 400 }
      );
    }

    // Delete the sale group
    await prisma.saleGroup.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Sale group deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale group:', error);
    return NextResponse.json(
      { error: 'Failed to delete sale group' },
      { status: 500 }
    );
  }
}
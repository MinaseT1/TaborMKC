import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/prisma'
import { generateMemberID } from '@/lib/id-utils'
import { ensureBucketExists, uploadImageToSupabase } from '@/lib/storage-utils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const firstName = formData.get('firstName') as string
    const middleName = formData.get('middleName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const subcity = formData.get('subcity') as string
    const kebele = formData.get('kebele') as string
    const specialPlaceName = formData.get('specialPlaceName') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const gender = formData.get('gender') as string
    const maritalStatus = formData.get('maritalStatus') as string
    const numberOfChildren = formData.get('numberOfChildren') as string
    const childrenAges = formData.get('childrenAges') as string
    const childrenInfo = formData.get('childrenInfo') as string
    const profession = formData.get('profession') as string
    const uniqueSkills = formData.get('uniqueSkills') as string
    const educationLevel = formData.get('educationLevel') as string

    const ministry = formData.get('ministry') as string
    const saleGroupId = formData.get('saleGroupId') as string
    const notes = formData.get('notes') as string
    const profileImage = formData.get('profileImage') as string | null

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required fields' },
        { status: 400 }
      )
    }

    // Validate email format if email is provided
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Please provide a valid email address' },
          { status: 400 }
        )
      }

      // Check if member with this email already exists
       const existingMember = await prisma.member.findFirst({
         where: { email }
       })

       if (existingMember) {
         return NextResponse.json(
           { error: 'A member with this email address already exists' },
           { status: 409 }
         )
       }
     }

    // Handle profile image upload to Supabase storage
    let profileImageUrl = null
    if (profileImage) {
      // Check if profileImage is a string (URL) or File object
      if (typeof profileImage === 'string') {
        // profileImage is a URL string from frontend (Supabase URL)
        if (profileImage.trim() !== '') {
          profileImageUrl = profileImage
        }
      } else if (profileImage instanceof File || (profileImage && typeof profileImage === 'object' && profileImage.name)) {
        // profileImage is a File object - upload it to Supabase
        try {
          // Ensure bucket exists
          const bucketReady = await ensureBucketExists()
          
          if (!bucketReady) {
            throw new Error('Cloud storage bucket is not available')
          }
          
          const uploadResult = await uploadImageToSupabase(
            profileImage as File,
            'member-photos',
            'profiles'
          )
          
          if (!uploadResult) {
            throw new Error('Failed to upload image to cloud storage')
          }
          
          profileImageUrl = uploadResult.url
        } catch (error) {
          console.error('❌ Error uploading image:', error)
          return NextResponse.json(
            { success: false, error: `Image upload failed: ${error.message}` },
            { status: 400 }
          )
        }
      }
    }

    // Parse JSON fields
    let parsedChildrenAges = null
    let parsedChildrenInfo = null
    let parsedUniqueSkills = null
    
    try {
      if (childrenAges) {
        const agesArray = JSON.parse(childrenAges)
        // Convert array to JSON string for database storage
        parsedChildrenAges = JSON.stringify(agesArray)
      }
    } catch (e) {
      console.warn('Failed to parse childrenAges:', e)
    }
    
    try {
      if (childrenInfo) {
        const childrenArray = JSON.parse(childrenInfo)
        // Convert array to JSON string for database storage
        parsedChildrenInfo = JSON.stringify(childrenArray)
      }
    } catch (e) {
      console.warn('Failed to parse childrenInfo:', e)
    }
    
    try {
      if (uniqueSkills) {
        const skillsArray = JSON.parse(uniqueSkills)
        // Convert array to JSON string for database storage
        parsedUniqueSkills = JSON.stringify(skillsArray)
      }
    } catch (e) {
      console.warn('Failed to parse uniqueSkills:', e)
    }

    // Get existing member IDs to generate unique MKC ID
    const existingMembers = await prisma.member.findMany({
      select: { id: true }
    });
    const existingIds = existingMembers.map(member => member.id);
    
    // Generate custom MKC ID
    const customId = generateMemberID(existingIds);

    // Create the new member with custom ID
    const newMember = await prisma.member.create({
      data: {
        id: customId,
        firstName,
        middleName: middleName || null,
        lastName,
        email: email && email.trim() !== '' ? email : null,
        phone: phone || null,
        subcity: subcity || null,
        kebele: kebele || null,
        specialPlaceName: specialPlaceName || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender ? gender.toUpperCase() : null,
        maritalStatus: maritalStatus ? maritalStatus.toUpperCase() : null,
        numberOfChildren: numberOfChildren ? parseInt(numberOfChildren) : null,
        childrenAges: parsedChildrenAges,
        // childrenInfo: parsedChildrenInfo, // Temporarily commented out until database migration
        profession: profession || null,
        uniqueSkills: parsedUniqueSkills,
        educationLevel: educationLevel ? educationLevel.toUpperCase() : null,
        profileImage: profileImageUrl,

        saleGroupId: saleGroupId && saleGroupId.trim() !== '' ? saleGroupId : null,
        notes: notes || null,
        status: 'ACTIVE',
        membershipType: 'REGULAR',
      },
    });

    // If ministry is specified, create the member-ministry relationship
    if (ministry && ministry !== '') {
      try {
        // Find the ministry by name
        const ministryRecord = await prisma.ministry.findFirst({
          where: {
            name: {
              contains: ministry,
              mode: 'insensitive'
            }
          }
        })

        if (ministryRecord) {
          await prisma.memberMinistry.create({
            data: {
              memberId: newMember.id,
              ministryId: ministryRecord.id,
              role: 'MEMBER',
              joinedAt: new Date()
            }
          })
        }
      } catch (ministryError) {
        // Log the error but don't fail the member creation
        console.warn('Failed to assign ministry:', ministryError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Member registered successfully!',
      member: {
        id: newMember.id,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        email: newMember.email,
        profileImage: newMember.profileImage
      }
    })

  } catch (error) {
    console.error('Member registration error:', error)
    
    // Handle Prisma-specific errors
    const prismaError = handlePrismaError(error)
    if (prismaError.error) {
      return NextResponse.json(prismaError, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to register member. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Fetch active members with sale group, zone and ministry information
    const members = await prisma.member.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        ministries: {
          include: {
            ministry: true
          },
          where: {
            isActive: true
          }
        },
        saleGroup: {
          include: {
            zone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to recent 50 members
    })

    // Transform the data to include ministry names, sale group, and zone information
    const transformedMembers = members.map(member => ({
      ...member,
      ministryNames: member.ministries.map(mm => mm.ministry.name).join(', ') || 'None',
      saleGroupName: member.saleGroup?.name || null,
      saleGroupLeaderName: member.saleGroup?.leaderName || null,
      zoneName: member.saleGroup?.zone?.name || null,
      zoneLeaderName: member.saleGroup?.zone?.leaderName || null
    }))

    return NextResponse.json({
      success: true,
      members: transformedMembers
    })
  } catch (error) {
    console.error('Failed to fetch members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Validate email format if email is being updated
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json(
          { error: 'Please provide a valid email address' },
          { status: 400 }
        )
      }

      // Check if another member with this email already exists
      const existingMember = await prisma.member.findFirst({
        where: { 
          email: updateData.email,
          id: { not: id }
        }
      })

      if (existingMember) {
        return NextResponse.json(
          { error: 'A member with this email address already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const dataToUpdate: Partial<{
      firstName: string;
      middleName: string | null;
      lastName: string;
      email: string;
      phone: string | null;
      subcity: string | null;
      kebele: string | null;
      specialPlaceName: string | null;
      numberOfChildren: number | null;
      childrenAges: string | null;
      profession: string | null;
      uniqueSkills: string | null;
      educationLevel: string | null;
      profileImage: string | null;
      dateOfBirth: Date | null;
      gender: string | null;
      maritalStatus: string | null;
      membershipType: string | null;
    }> = {}
    
    if (updateData.firstName) dataToUpdate.firstName = updateData.firstName
    if (updateData.middleName !== undefined) dataToUpdate.middleName = updateData.middleName || null
    if (updateData.lastName) dataToUpdate.lastName = updateData.lastName
    if (updateData.email) dataToUpdate.email = updateData.email
    if (updateData.phone !== undefined) dataToUpdate.phone = updateData.phone || null
    if (updateData.subcity !== undefined) dataToUpdate.subcity = updateData.subcity || null
    if (updateData.kebele !== undefined) dataToUpdate.kebele = updateData.kebele || null
    if (updateData.specialPlaceName !== undefined) dataToUpdate.specialPlaceName = updateData.specialPlaceName || null
    if (updateData.numberOfChildren !== undefined) {
      dataToUpdate.numberOfChildren = updateData.numberOfChildren ? parseInt(updateData.numberOfChildren) : null
    }
    if (updateData.childrenAges !== undefined) {
      // Convert array to JSON string for database storage
      dataToUpdate.childrenAges = updateData.childrenAges ? JSON.stringify(updateData.childrenAges) : null
    }
    // if (updateData.childrenInfo !== undefined) {
    //   // Convert array to JSON string for database storage
    //   dataToUpdate.childrenInfo = updateData.childrenInfo ? JSON.stringify(updateData.childrenInfo) : null
    // } // Temporarily commented out until database migration
    if (updateData.profession !== undefined) dataToUpdate.profession = updateData.profession || null
    if (updateData.uniqueSkills !== undefined) {
      // Convert array to JSON string for database storage
      dataToUpdate.uniqueSkills = updateData.uniqueSkills ? JSON.stringify(updateData.uniqueSkills) : null
    }
    if (updateData.educationLevel !== undefined) {
      dataToUpdate.educationLevel = updateData.educationLevel ? updateData.educationLevel.toUpperCase() : null
    }
    if (updateData.profileImage !== undefined) dataToUpdate.profileImage = updateData.profileImage || null
    if (updateData.dateOfBirth !== undefined) {
      dataToUpdate.dateOfBirth = updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null
    }
    if (updateData.gender !== undefined) {
      dataToUpdate.gender = updateData.gender ? updateData.gender.toUpperCase() : null
    }
    if (updateData.maritalStatus !== undefined) {
      dataToUpdate.maritalStatus = updateData.maritalStatus ? updateData.maritalStatus.toUpperCase() : null
    }
    if (updateData.emergencyContactName !== undefined) {
      dataToUpdate.emergencyContactName = updateData.emergencyContactName || null
    }
    if (updateData.emergencyContactPhone !== undefined) {
      dataToUpdate.emergencyContactPhone = updateData.emergencyContactPhone || null
    }
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status
    if (updateData.membershipType !== undefined) dataToUpdate.membershipType = updateData.membershipType
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes || null

    const updatedMember = await prisma.member.update({
      where: { id },
      data: dataToUpdate,
      include: {
        ministries: {
          include: {
            ministry: true
          },
          where: {
            isActive: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully!',
      member: {
        ...updatedMember,
        ministryNames: updatedMember.ministries.map(mm => mm.ministry.name).join(', ') || 'None'
      }
    })

  } catch (error) {
    console.error('Member update error:', error)
    
    // Handle Prisma-specific errors
    const prismaError = handlePrismaError(error)
    if (prismaError.error) {
      return NextResponse.json(prismaError, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update member. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Delete member-ministry relationships first
    await prisma.memberMinistry.deleteMany({
      where: { memberId: id }
    })

    // Delete the member
    await prisma.member.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully!'
    })

  } catch (error) {
    console.error('Member deletion error:', error)
    
    // Handle Prisma-specific errors
    const prismaError = handlePrismaError(error)
    if (prismaError.error) {
      return NextResponse.json(prismaError, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to delete member. Please try again later.' },
      { status: 500 }
    )
  }
}
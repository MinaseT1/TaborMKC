import { prisma } from './prisma'
import type { User, Member } from '@prisma/client'

// User operations
export const userService = {
  async createUser(data: {
    email: string
    name: string
    role?: 'ADMIN' | 'PASTOR' | 'MEMBER' | 'VOLUNTEER'
    phone?: string
  }) {
    try {
      return await prisma.user.create({
        data: {
          ...data,
          role: data.role || 'MEMBER',
        },
      })
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        member: true,
        sessions: true,
      },
    })
  },

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        member: true,
      },
    })
  },

  async updateUser(id: string, data: Partial<User>) {
    return await prisma.user.update({
      where: { id },
      data,
    })
  },

  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    })
  },
}

// Member operations
export const memberService = {
  async createMember(data: {
    userId: string
    firstName: string
    lastName: string
    dateOfBirth?: Date
    phone?: string
    address?: string
    membershipDate?: Date
    familyId?: string
  }) {
    return await prisma.member.create({
      data: {
        ...data,
        membershipDate: data.membershipDate || new Date(),
      },
    })
  },

  async getAllMembers() {
    return await prisma.member.findMany({
      include: {
        user: true,
        family: true,
        ministries: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    })
  },

  async getMemberById(id: string) {
    return await prisma.member.findUnique({
      where: { id },
      include: {
        user: true,
        family: true,
        ministries: true,
      },
    })
  },

  async updateMember(id: string, data: Partial<Member>) {
    return await prisma.member.update({
      where: { id },
      data,
    })
  },

  async deleteMember(id: string) {
    return await prisma.member.delete({
      where: { id },
    })
  },
}



// Communication operations
export const communicationService = {
  async createCommunication(data: {
    title: string
    content: string
    type: 'ANNOUNCEMENT' | 'NEWSLETTER' | 'PRAYER_REQUEST'
    senderId: string
    recipientType: 'ALL' | 'MEMBERS' | 'MINISTRY' | 'SPECIFIC'
  }) {
    return await prisma.communication.create({
      data,
    })
  },

  async getAllCommunications() {
    return await prisma.communication.findMany({
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  async getCommunicationById(id: string) {
    return await prisma.communication.findUnique({
      where: { id },
      include: {
        sender: true,
      },
    })
  },
}

// Ministry operations
export const ministryService = {
  async createMinistry(data: {
    name: string
    description?: string
    leaderId?: string
  }) {
    return await prisma.ministry.create({
      data,
    })
  },

  async getAllMinistries() {
    return await prisma.ministry.findMany({
      include: {
        leader: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    })
  },

  async getMinistryById(id: string) {
    return await prisma.ministry.findUnique({
      where: { id },
      include: {
        leader: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    })
  },
}

// Donation operations
export const donationService = {
  async createDonation(data: {
    amount: number
    donorId?: string
    donorName?: string
    purpose?: string
    method: 'CASH' | 'CHECK' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE'
  }) {
    return await prisma.donation.create({
      data,
    })
  },

  async getAllDonations() {
    return await prisma.donation.findMany({
      include: {
        donor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  async getDonationsByDateRange(startDate: Date, endDate: Date) {
    return await prisma.donation.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        donor: true,
      },
    })
  },
}

// Analytics and Reports
export const analyticsService = {
  async getMembershipStats() {
    const totalMembers = await prisma.member.count()
    const newMembersThisMonth = await prisma.member.count({
      where: {
        membershipDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    })
    
    return {
      totalMembers,
      newMembersThisMonth,
    }
  },

  async getDonationStats() {
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    
    const totalDonationsThisMonth = await prisma.donation.aggregate({
      where: {
        createdAt: {
          gte: thisMonth,
          lt: nextMonth,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })
    
    return {
      totalAmount: totalDonationsThisMonth._sum.amount || 0,
      totalCount: totalDonationsThisMonth._count,
    }
  },


}
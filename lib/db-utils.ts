import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

// Database transaction helper
export async function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback, {
    maxWait: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
    isolationLevel: 'ReadCommitted',
  })
}

// Pagination helper
export interface PaginationOptions {
  page?: number
  limit?: number
  orderBy?: Record<string, 'asc' | 'desc'>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function paginate<T>(
  model: Record<string, unknown>,
  options: PaginationOptions & { where?: Record<string, unknown>; include?: Record<string, unknown> } = {}
): Promise<PaginatedResult<T>> {
  const { page = 1, limit = 10, orderBy, where, include } = options
  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

// Search helper with full-text search
export async function searchMembers(query: string, options: PaginationOptions = {}) {
  const searchTerms = query.split(' ').filter(term => term.length > 0)
  
  if (searchTerms.length === 0) {
    return paginate(prisma.member, options)
  }

  const whereClause = {
    OR: searchTerms.flatMap(term => [
      { firstName: { contains: term, mode: 'insensitive' as const } },
      { lastName: { contains: term, mode: 'insensitive' as const } },
      { email: { contains: term, mode: 'insensitive' as const } },
      { phone: { contains: term, mode: 'insensitive' as const } },
    ]),
  }

  return paginate(prisma.member, {
    ...options,
    where: whereClause,
    include: {
      user: true,
      family: true,
      ministries: {
        include: {
          ministry: true,
        },
      },
    },
  })
}

// Bulk operations helper
export async function bulkUpsert<T>(
  model: Record<string, unknown>,
  data: T[],
  uniqueFields: string[]
) {
  return await withTransaction(async (tx) => {
    const results = []
    
    for (const item of data) {
      const whereClause = uniqueFields.reduce((acc, field) => {
        acc[field] = (item as Record<string, unknown>)[field]
        return acc
      }, {} as Record<string, unknown>)

      const result = await (tx as Record<string, unknown>)[model.name as string].upsert({
        where: whereClause,
        update: item,
        create: item,
      })
      
      results.push(result)
    }
    
    return results
  })
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date() }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date() 
    }
  }
}

// Clean up expired sessions
export async function cleanupExpiredSessions() {
  const result = await prisma.session.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isActive: false },
      ],
    },
  })
  
  return { deletedCount: result.count }
}

// Archive old audit logs (older than 1 year)
export async function archiveOldAuditLogs() {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: oneYearAgo },
    },
  })
  
  return { archivedCount: result.count }
}

// Get database statistics
export async function getDatabaseStats() {
  const [users, members, ministries, donations] = await Promise.all([
    prisma.user.count(),
    prisma.member.count(),
    prisma.ministry.count(),
    prisma.donation.aggregate({
      _sum: { amount: true },
      _count: true,
    }),
  ])

  return {
    users,
    members,
    ministries,
    donations: {
      count: donations._count,
      totalAmount: donations._sum.amount || 0,
    },
    timestamp: new Date(),
  }
}

// Soft delete helper (for models that support it)
export async function softDelete(model: Record<string, unknown>, id: string) {
  return await model.update({
    where: { id },
    data: { 
      isActive: false,
      deletedAt: new Date(),
    },
  })
}

// Restore soft deleted record
export async function restoreSoftDeleted(model: Record<string, unknown>, id: string) {
  return await model.update({
    where: { id },
    data: { 
      isActive: true,
      deletedAt: null,
    },
  })
}
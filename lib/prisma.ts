import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle database errors
export const handlePrismaError = (error: unknown) => {
  console.error('Database error:', error)
  
  // Unique constraint violation
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field'
    return { error: `A record with this ${field} already exists.` }
  }
  
  // Record not found
  if (error.code === 'P2025') {
    return { error: 'The requested record was not found.' }
  }
  
  // Foreign key constraint failed
  if (error.code === 'P2003') {
    return { error: 'Cannot delete this record because it is referenced by other records.' }
  }
  
  // Required field missing
  if (error.code === 'P2012') {
    return { error: 'A required field is missing.' }
  }
  
  // Invalid data type
  if (error.code === 'P2006') {
    return { error: 'Invalid data provided for one or more fields.' }
  }
  
  // Connection error
  if (error.code === 'P1001') {
    return { error: 'Database connection failed. Please try again later.' }
  }
  
  // Server has closed the connection
  if (error.code === 'P1017') {
    return { error: 'Database connection was closed. Please try again.' }
  }
  
  // Timeout
  if (error.code === 'P1008') {
    return { error: 'Database operation timed out. Please try again.' }
  }
  
  return { error: 'An unexpected database error occurred. Please contact support if this persists.' }
}

// Helper function to safely disconnect Prisma
export const disconnectPrisma = async () => {
  await prisma.$disconnect()
}
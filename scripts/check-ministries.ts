import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMinistries() {
  console.log('📋 Checking ministries in database...')
  
  const ministries = await prisma.ministry.findMany({
    select: {
      id: true,
      name: true,
      isActive: true
    }
  })
  
  console.log('Found ministries:')
  ministries.forEach(ministry => {
    console.log(`- ID: ${ministry.id}, Name: ${ministry.name}, Active: ${ministry.isActive}`)
  })
  
  console.log(`\nTotal ministries: ${ministries.length}`)
}

checkMinistries()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
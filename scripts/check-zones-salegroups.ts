import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkZonesAndSaleGroups() {
  console.log('📋 Checking zones and sale groups in database...')
  
  const zones = await prisma.zone.findMany({
    select: {
      id: true,
      name: true,
      isActive: true
    }
  })
  
  console.log('Found zones:')
  zones.forEach(zone => {
    console.log(`- ID: ${zone.id}, Name: ${zone.name}, Active: ${zone.isActive}`)
  })
  
  const saleGroups = await prisma.saleGroup.findMany({
    select: {
      id: true,
      name: true,
      leaderName: true,
      zoneId: true,
      isActive: true
    }
  })
  
  console.log('\nFound sale groups:')
  saleGroups.forEach(sg => {
    console.log(`- ID: ${sg.id}, Name: ${sg.name}, Leader: ${sg.leaderName}, ZoneID: ${sg.zoneId}, Active: ${sg.isActive}`)
  })
  
  console.log(`\nTotal zones: ${zones.length}`)
  console.log(`Total sale groups: ${saleGroups.length}`)
}

checkZonesAndSaleGroups()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
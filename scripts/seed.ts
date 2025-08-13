import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample zones
  const zones = await Promise.all([
    prisma.zone.upsert({
      where: { name: 'Central Zone' },
      update: {},
      create: {
        name: 'Central Zone',
        description: 'Central area of the city',
        leaderName: 'John Smith',
        isActive: true,
        notes: 'Main zone covering downtown area'
      }
    }),
    prisma.zone.upsert({
      where: { name: 'North Zone' },
      update: {},
      create: {
        name: 'North Zone',
        description: 'Northern suburbs',
        leaderName: 'Mary Johnson',
        isActive: true,
        notes: 'Covers northern residential areas'
      }
    }),
    prisma.zone.upsert({
      where: { name: 'South Zone' },
      update: {},
      create: {
        name: 'South Zone',
        description: 'Southern districts',
        leaderName: 'David Wilson',
        isActive: true,
        notes: 'Includes industrial and residential areas'
      }
    })
  ])

  console.log('✅ Created zones:', zones.map(z => z.name).join(', '))

  // Create sample sale groups for each zone
  const saleGroups = []
  
  // Central Zone sale groups
  const centralSaleGroups = await Promise.all([
    prisma.saleGroup.upsert({
      where: { name_zoneId: { name: 'Alpha Group', zoneId: zones[0].id } },
      update: {},
      create: {
        name: 'Alpha Group',
        leaderName: 'Sarah Davis',
        zoneId: zones[0].id,
        isActive: true,
        notes: 'Young professionals group'
      }
    }),
    prisma.saleGroup.upsert({
      where: { name_zoneId: { name: 'Beta Group', zoneId: zones[0].id } },
      update: {},
      create: {
        name: 'Beta Group',
        leaderName: 'Michael Brown',
        zoneId: zones[0].id,
        isActive: true,
        notes: 'Family-oriented group'
      }
    })
  ])

  // North Zone sale groups
  const northSaleGroups = await Promise.all([
    prisma.saleGroup.upsert({
      where: { name_zoneId: { name: 'Gamma Group', zoneId: zones[1].id } },
      update: {},
      create: {
        name: 'Gamma Group',
        leaderName: 'Lisa Anderson',
        zoneId: zones[1].id,
        isActive: true,
        notes: 'Community outreach focused'
      }
    }),
    prisma.saleGroup.upsert({
      where: { name_zoneId: { name: 'Delta Group', zoneId: zones[1].id } },
      update: {},
      create: {
        name: 'Delta Group',
        leaderName: 'Robert Taylor',
        zoneId: zones[1].id,
        isActive: true,
        notes: 'Youth ministry group'
      }
    })
  ])

  // South Zone sale groups
  const southSaleGroups = await Promise.all([
    prisma.saleGroup.upsert({
      where: { name_zoneId: { name: 'Epsilon Group', zoneId: zones[2].id } },
      update: {},
      create: {
        name: 'Epsilon Group',
        leaderName: 'Jennifer White',
        zoneId: zones[2].id,
        isActive: true,
        notes: 'Senior members group'
      }
    })
  ])

  saleGroups.push(...centralSaleGroups, ...northSaleGroups, ...southSaleGroups)
  console.log('✅ Created sale groups:', saleGroups.map(sg => sg.name).join(', '))

  // Create sample ministries
  const ministries = await Promise.all([
    prisma.ministry.upsert({
      where: { name: 'Worship Ministry' },
      update: {},
      create: {
        name: 'Worship Ministry',
        description: 'Leading worship services and music',
        meetingDay: 'Sunday',
        meetingTime: '09:00',
        location: 'Main Sanctuary',
        capacity: 50,
        isActive: true,
        notes: 'Leader: Pastor James\nAssistant: Maria Garcia'
      }
    }),
    prisma.ministry.upsert({
      where: { name: 'Youth Ministry' },
      update: {},
      create: {
        name: 'Youth Ministry',
        description: 'Ministry for teenagers and young adults',
        meetingDay: 'Friday',
        meetingTime: '19:00',
        location: 'Youth Hall',
        capacity: 100,
        isActive: true,
        notes: 'Leader: Pastor Mike\nAssistant: Sarah Johnson'
      }
    }),
    prisma.ministry.upsert({
      where: { name: 'Children Ministry' },
      update: {},
      create: {
        name: 'Children Ministry',
        description: 'Sunday school and children programs',
        meetingDay: 'Sunday',
        meetingTime: '10:30',
        location: 'Children Hall',
        capacity: 80,
        isActive: true,
        notes: 'Leader: Teacher Anna\nAssistant: Teacher Beth'
      }
    })
  ])

  console.log('✅ Created ministries:', ministries.map(m => m.name).join(', '))

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
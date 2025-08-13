# Database Architecture & Setup Guide

## Overview

This church management system uses **PostgreSQL** as the primary database with **Prisma** as the ORM. The database has been optimized for performance, scalability, and data integrity.

## Database Schema

### Core Models

#### Users & Authentication
- **User**: Core user authentication and basic info
- **Session**: User session management with expiration
- **Member**: Detailed member information linked to users

#### Family & Relationships
- **Family**: Family groupings for members
- Supports family-based reporting and communication


#### Ministries
- **Ministry**: Church ministries and departments
- **MemberMinistry**: Junction table for member-ministry relationships

#### Financial
- **Donation**: Financial contributions tracking
- Supports recurring donations and multiple payment methods

#### Communication
- **Communication**: Messages, announcements, and notifications
- Supports scheduling and delivery tracking

#### System
- **Report**: Generated reports and analytics
- **ChurchSettings**: Configurable church settings
- **AuditLog**: Change tracking and audit trail
- **Backup**: Database backup management

## Performance Optimizations

### Indexes

The schema includes strategic indexes for:
- **Search operations**: Name, email, phone lookups
- **Filtering**: Status, type, date-based queries
- **Relationships**: Foreign key relationships
- **Reporting**: Date ranges, aggregations

### Data Types

- **Timestamps**: Using `@db.Timestamptz(6)` for timezone-aware dates
- **Text fields**: Appropriate varchar limits vs text fields
- **Decimals**: Proper precision for financial data
- **BigInt**: For large file sizes and counts

### Constraints

- **Unique constraints**: Prevent duplicate data
- **Foreign key constraints**: Maintain referential integrity
- **Check constraints**: Data validation at database level
- **Not null constraints**: Required field enforcement

## Setup Instructions

### 1. Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/church_db"
DIRECT_URL="postgresql://username:password@localhost:5432/church_db"

# Optional: For connection pooling
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with initial data
npm run db:seed

# Validate schema
npm run db:validate
```

### 4. Development Tools

```bash
# Open Prisma Studio
npm run db:studio

# Push schema changes (development)
npm run db:push

# Pull schema from database
npm run db:pull
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `db:migrate` | Run database migrations |
| `db:generate` | Generate Prisma client |
| `db:seed` | Seed database with initial data |
| `db:backup` | Create database backup |
| `db:validate` | Validate database schema |
| `db:cleanup` | Clean up old data |
| `db:reset` | Reset database and seed |
| `db:deploy` | Full deployment process |
| `db:studio` | Open Prisma Studio |
| `db:push` | Push schema changes |
| `db:pull` | Pull schema from database |

## Database Utilities

### Transaction Helper

```typescript
import { withTransaction } from '@/lib/db-utils'

const result = await withTransaction(async (tx) => {
  // Multiple operations in a single transaction
  const user = await tx.user.create({ data: userData })
  const member = await tx.member.create({ data: { ...memberData, userId: user.id } })
  return { user, member }
})
```

### Pagination Helper

```typescript
import { paginate } from '@/lib/db-utils'

const result = await paginate(prisma.member, {
  page: 1,
  limit: 10,
  where: { status: 'ACTIVE' },
  orderBy: { firstName: 'asc' }
})
```

### Search Helper

```typescript
import { searchMembers } from '@/lib/db-utils'

const results = await searchMembers('john doe', {
  page: 1,
  limit: 20
})
```

## Error Handling

The system includes comprehensive error handling for common Prisma errors:

- **P2002**: Unique constraint violations
- **P2025**: Record not found
- **P2003**: Foreign key constraint failures
- **P1001**: Connection errors
- **P1008**: Timeout errors

## Backup & Recovery

### Automated Backups

```bash
# Create backup
npm run db:backup
```

### Manual Backup (PostgreSQL)

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore

```bash
psql $DATABASE_URL < backup.sql
```

## Monitoring & Maintenance

### Health Checks

```typescript
import { checkDatabaseHealth } from '@/lib/db-utils'

const health = await checkDatabaseHealth()
console.log(health.status) // 'healthy' or 'unhealthy'
```

### Cleanup Tasks

```bash
# Clean expired sessions and old audit logs
npm run db:cleanup
```

### Database Statistics

```typescript
import { getDatabaseStats } from '@/lib/db-utils'

const stats = await getDatabaseStats()
console.log(stats)
```

## Security Best Practices

1. **Environment Variables**: Never commit database credentials
2. **Connection Pooling**: Use connection pooling in production
3. **SSL**: Enable SSL for production databases
4. **Audit Logging**: All changes are logged in audit_logs table
5. **Session Management**: Sessions expire automatically
6. **Data Validation**: Validation at both application and database level

## Production Deployment

### 1. Environment Setup

```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="your-production-db-url"
```

### 2. Deploy Database Changes

```bash
# Full deployment
npm run db:deploy
```

### 3. Connection Pooling

For production, consider using connection pooling:

```typescript
// In production, use connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})
```

## Troubleshooting

### Common Issues

1. **Migration Failures**
   ```bash
   npx prisma migrate reset
   npm run db:seed
   ```

2. **Client Generation Issues**
   ```bash
   npx prisma generate --force
   ```

3. **Connection Issues**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check firewall settings

4. **Performance Issues**
   - Review query patterns
   - Check index usage
   - Monitor connection pool

### Debugging

Enable query logging in development:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

## Migration Strategy

### Development
1. Make schema changes in `schema.prisma`
2. Run `npx prisma db push` for quick iteration
3. Create migration when ready: `npx prisma migrate dev`

### Production
1. Test migrations in staging environment
2. Create backup before deployment
3. Run `npm run db:deploy`
4. Validate deployment with `npm run db:validate`

## Contributing

When making database changes:

1. Update the schema in `prisma/schema.prisma`
2. Add appropriate indexes for new queries
3. Update the migration script if needed
4. Test with sample data
5. Update this documentation

## Support

For database-related issues:

1. Check the logs for specific error codes
2. Use the error handling utilities
3. Run database validation
4. Check connection and permissions
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.update({
    where: { email: 'admin@example.com' }, // Replace with admin email
    data: { isAdmin: true }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 
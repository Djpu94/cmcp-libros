import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error('SEED_ADMIN_PASSWORD must be set');
  }

  const hashedPassword = await hash(password, 12);

  await prisma.user.upsert({
    where: { email: 'admin@cmcp.cl' },
    update: {},
    create: {
      email: 'admin@cmcp.cl',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed the admin user:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import * as argon2 from "argon2";
import { prisma } from "./client";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      "ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required for seeding"
    );
    console.error(
      "Example: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret123 npx prisma db seed"
    );
    process.exit(1);
  }

  console.log(`Seeding admin user: ${adminEmail}`);

  const passwordHash = await argon2.hash(adminPassword);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Admin user created/updated: ${user.id} (${user.email})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

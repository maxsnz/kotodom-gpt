import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.setting.upsert({
    where: { id: "adminUser" },
    update: {},
    create: {
      id: "adminUser",
      value: "admin",
    },
  });

  await prisma.setting.upsert({
    where: { id: "adminPassword" },
    update: {},
    create: {
      id: "adminPassword",
      value: "admin",
    },
  });

  // await prisma.user.upsert({
  //   where: { id: 0 },
  //   update: {},
  //   create: {
  //     username: "chatgpt",
  //     fullName: "chat GPT",
  //     id: 0,
  //     createdAt: new Date(),
  //   },
  // });
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

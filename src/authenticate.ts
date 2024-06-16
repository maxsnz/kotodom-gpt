import * as dotenv from "dotenv";
import { CurrentAdmin } from "adminjs";
import prisma from "./prismaClient";

dotenv.config();

export default async (login: string, password: string) => {
  const adminUser =
    (
      await prisma.setting.findUnique({
        where: { id: "adminUser" },
      })
    )?.value || "admin";
  const adminPassword =
    (
      await prisma.setting.findUnique({
        where: { id: "adminPassword" },
      })
    )?.value || "admin";

  if (login === adminUser && password === adminPassword) {
    const admin = {
      email: login,
    } as CurrentAdmin;
    return Promise.resolve(admin);
  }
  return null;
};

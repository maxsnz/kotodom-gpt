import prisma from "../prismaClient";

export const getSetting = async (
  key: string,
): Promise<string | null> => {
  const setting = await prisma.setting.findUnique({
    where: { id: key },
  });
  return setting?.value || null;
};

export const setSetting = async (
  key: string,
  value: string,
): Promise<void> => {
  await prisma.setting.upsert({
    where: { id: key },
    update: { value },
    create: { id: key, value },
  });
};

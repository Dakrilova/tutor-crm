import { prisma } from "../../utils/prisma";

export default defineEventHandler(async () => {
  const usersCount = await prisma.user.count();
  const lessonsCount = await prisma.lesson.count();

  return {
    ok: true,
    message: "Prisma connected successfully",
    usersCount,
    lessonsCount,
  };
});
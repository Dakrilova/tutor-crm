import { prisma } from "../../utils/prisma";
import { requireAdminUser } from "../../utils/require-admin";

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);

  const [
    teachersCount,
    adminsCount,
    coursesCount,
    lessonsCount,
    completedLessonsCount,
    paidLessonsCount
  ] = await Promise.all([
    prisma.user.count({
      where: { role: "TEACHER" }
    }),
    prisma.user.count({
      where: { role: "ADMIN" }
    }),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.lesson.count({
      where: { status: "DONE" }
    }),
    prisma.lesson.count({
      where: { isPaid: true }
    })
  ]);

  return {
    ok: true,
    stats: {
      teachersCount,
      adminsCount,
      coursesCount,
      lessonsCount,
      completedLessonsCount,
      paidLessonsCount
    }
  };
});
import { prisma } from "../../utils/prisma";
import { getUserIdFromSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromSession(event);

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Вы не авторизованы"
    });
  }

  const courses = await prisma.course.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      lessons: {
        orderBy: {
          startAt: "asc"
        },
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
          status: true,
          isPaid: true
        }
      }
    }
  });

  return {
    ok: true,
    courses
  };
});
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

  const lessons = await prisma.lesson.findMany({
    where: {
      userId
    },
    orderBy: {
      startAt: "asc"
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          targetName: true
        }
      },
      student: {
        select: {
          id: true,
          fullName: true
        }
      },
      group: {
        select: {
          id: true,
          title: true
        }
      },
      materials: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  return {
    ok: true,
    lessons
  };
});
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

  const id = Number(getRouterParam(event, "id"));

  if (!Number.isFinite(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный курс"
    });
  }

  const course = await prisma.course.findFirst({
    where: {
      id,
      userId
    },
    include: {
      lessons: {
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
          }
        }
      }
    }
  });

  if (!course) {
    throw createError({
      statusCode: 404,
      statusMessage: "Курс не найден"
    });
  }

  return {
    ok: true,
    course
  };
});
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

  const body = await readBody(event);

  const id = Number(body.id);
  const status = String(body.status || "");

  const allowedStatuses = ["FREE", "RESERVED", "PAID", "IN_PROGRESS", "DONE"];

  if (!Number.isFinite(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный урок"
    });
  }

  if (!allowedStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный статус"
    });
  }

  const existingLesson = await prisma.lesson.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingLesson) {
    throw createError({
      statusCode: 404,
      statusMessage: "Урок не найден"
    });
  }

  const updatedLesson = await prisma.lesson.update({
    where: { id },
    data: {
      status: status as any
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
  });

  return {
    ok: true,
    lesson: updatedLesson
  };
});
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

  if (!Number.isFinite(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный курс"
    });
  }

  const existingCourse = await prisma.course.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingCourse) {
    throw createError({
      statusCode: 404,
      statusMessage: "Курс не найден"
    });
  }

  await prisma.lesson.deleteMany({
    where: {
      courseId: id,
      userId
    }
  });

  await prisma.course.delete({
    where: {
      id
    }
  });

  return {
    ok: true,
    deletedId: id
  };
});
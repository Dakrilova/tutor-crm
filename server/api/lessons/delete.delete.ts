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
      statusMessage: "Некорректный урок"
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

  await prisma.lesson.delete({
    where: { id }
  });

  return {
    ok: true,
    deletedId: id
  };
});
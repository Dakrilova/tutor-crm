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

  const lessonId = Number(getRouterParam(event, "id"));

  if (!Number.isFinite(lessonId) || lessonId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный ID занятия"
    });
  }

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      userId
    }
  });

  if (!lesson) {
    throw createError({
      statusCode: 404,
      statusMessage: "Занятие не найдено"
    });
  }

  const materials = await prisma.lessonMaterial.findMany({
    where: {
      lessonId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return {
    ok: true,
    materials
  };
});
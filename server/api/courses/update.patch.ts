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
  const title = String(body.title || "").trim();
  const targetName = String(body.targetName || "").trim();

  if (!Number.isFinite(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный курс"
    });
  }

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: "Название курса обязательно"
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

  const course = await prisma.course.update({
    where: {
      id
    },
    data: {
      title,
      targetName: targetName || null
    }
  });

  return {
    ok: true,
    course
  };
});
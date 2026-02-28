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

  const title = String(body.title || "").trim();
  const targetName = String(body.targetName || "").trim();

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: "Название курса обязательно"
    });
  }

  const course = await prisma.course.create({
    data: {
      title,
      targetName: targetName || null,
      userId
    }
  });

  return {
    ok: true,
    course
  };
});
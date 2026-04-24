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

  const body = await readBody<{
    lessonId?: number;
    title?: string;
    url?: string;
    type?: string;
    description?: string;
  }>(event);

  const lessonId = Number(body.lessonId);
  const title = String(body.title || "").trim();
  const url = String(body.url || "").trim();
  const type = String(body.type || "").trim();
  const description = String(body.description || "").trim();

  if (!Number.isFinite(lessonId) || lessonId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный ID занятия"
    });
  }

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: "Введите название материала"
    });
  }

  if (title.length > 120) {
    throw createError({
      statusCode: 400,
      statusMessage: "Название материала слишком длинное"
    });
  }

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: "Введите ссылку на материал"
    });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ссылка должна начинаться с http:// или https://"
    });
  }

  const allowedTypes = ["PDF", "Презентация", "Видео", "Документ", "Другое"];

  if (!allowedTypes.includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный тип материала"
    });
  }

  if (description.length > 500) {
    throw createError({
      statusCode: 400,
      statusMessage: "Описание материала слишком длинное"
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

  const material = await prisma.lessonMaterial.create({
    data: {
      lessonId,
      title,
      url,
      type,
      description: description || null
    }
  });

  return {
    ok: true,
    material
  };
});
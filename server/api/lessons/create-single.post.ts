import { prisma } from "../../utils/prisma";
import { getUserIdFromSession } from "../../utils/session";
import {
  ensureLessonSlotIsFree,
  parseLessonDates,
  validateLessonTimeWindow
} from "../../utils/lesson-validation";

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
  const startAt = String(body.startAt || "").trim();
  const endAt = String(body.endAt || "").trim();
  const status = String(body.status || "FREE");
  const linkUrl = String(body.linkUrl || "").trim();
  const isPaid = Boolean(body.isPaid);

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: "Название занятия обязательно"
    });
  }

  if (!startAt || !endAt) {
    throw createError({
      statusCode: 400,
      statusMessage: "Укажите дату и время начала и конца"
    });
  }

  const allowedStatuses = ["FREE", "RESERVED", "PAID", "IN_PROGRESS", "DONE"];

  if (!allowedStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный статус занятия"
    });
  }

  const { startDate, endDate } = parseLessonDates(startAt, endAt);

  validateLessonTimeWindow(startDate, endDate);
  await ensureLessonSlotIsFree(userId, startDate, endDate);

  const lesson = await prisma.lesson.create({
    data: {
      title,
      targetName: targetName || null,
      startAt: startDate,
      endAt: endDate,
      status: status as any,
      linkUrl: linkUrl || null,
      isPaid,
      userId,
      courseId: null
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
    lesson
  };
});
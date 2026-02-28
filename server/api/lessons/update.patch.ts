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

  const id = Number(body.id);
  const title = String(body.title || "").trim();
  const targetName = String(body.targetName || "").trim();
  const startAt = String(body.startAt || "").trim();
  const endAt = String(body.endAt || "").trim();
  const status = String(body.status || "FREE");
  const linkUrl = String(body.linkUrl || "").trim();
  const isPaid = Boolean(body.isPaid);

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

  if (!existingLesson) {
    throw createError({
      statusCode: 404,
      statusMessage: "Урок не найден"
    });
  }

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
  await ensureLessonSlotIsFree(userId, startDate, endDate, id);

  const updatedLesson = await prisma.lesson.update({
    where: { id },
    data: {
      title,
      targetName: targetName || null,
      startAt: startDate,
      endAt: endDate,
      status: status as any,
      linkUrl: linkUrl || null,
      isPaid
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
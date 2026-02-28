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

  const courseId = Number(body.courseId);
  const title = String(body.title || "").trim();
  const startAt = String(body.startAt || "").trim();
  const endAt = String(body.endAt || "").trim();
  const status = String(body.status || "FREE");
  const linkUrl = String(body.linkUrl || "").trim();
  const isPaid = Boolean(body.isPaid);

  if (!Number.isFinite(courseId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный курс"
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

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      userId
    }
  });

  if (!course) {
    throw createError({
      statusCode: 404,
      statusMessage: "Курс не найден"
    });
  }

  const { startDate, endDate } = parseLessonDates(startAt, endAt);

  validateLessonTimeWindow(startDate, endDate);
  await ensureLessonSlotIsFree(userId, startDate, endDate);

  const lesson = await prisma.lesson.create({
    data: {
      title,
      targetName: course.targetName || null,
      startAt: startDate,
      endAt: endDate,
      status: status as any,
      linkUrl: linkUrl || null,
      isPaid,
      userId,
      courseId: course.id
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
import { prisma } from "./prisma";

export function parseLessonDates(startAtRaw: string, endAtRaw: string) {
  const startDate = new Date(startAtRaw);
  const endDate = new Date(endAtRaw);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректная дата или время"
    });
  }

  return { startDate, endDate };
}

export function validateLessonTimeWindow(startDate: Date, endDate: Date) {
  const now = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (startDate < now || endDate < now) {
    throw createError({
      statusCode: 400,
      statusMessage: "Нельзя создавать занятия в прошлом"
    });
  }

  if (startDate > maxDate || endDate > maxDate) {
    throw createError({
      statusCode: 400,
      statusMessage: "Можно выбирать дату не дальше чем на 1 год вперед"
    });
  }

  if (endDate <= startDate) {
    throw createError({
      statusCode: 400,
      statusMessage: "Время окончания должно быть позже времени начала"
    });
  }

  const isSameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  if (!isSameDay) {
    throw createError({
      statusCode: 400,
      statusMessage: "Один урок должен проходить в пределах одного дня"
    });
  }

  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
  const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

  const minMinutes = 8 * 60;
  const maxMinutes = 22 * 60;

  if (startMinutes < minMinutes || startMinutes > maxMinutes) {
    throw createError({
      statusCode: 400,
      statusMessage: "Время начала должно быть с 08:00 до 22:00"
    });
  }

  if (endMinutes < minMinutes || endMinutes > maxMinutes) {
    throw createError({
      statusCode: 400,
      statusMessage: "Время окончания должно быть с 08:00 до 22:00"
    });
  }
}

export async function ensureLessonSlotIsFree(
  userId: number,
  startDate: Date,
  endDate: Date,
  ignoreLessonId?: number
) {
  const conflict = await prisma.lesson.findFirst({
    where: {
      userId,
      ...(ignoreLessonId ? { id: { not: ignoreLessonId } } : {}),
      startAt: {
        lt: endDate
      },
      endAt: {
        gt: startDate
      }
    },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true
    }
  });

  if (conflict) {
    throw createError({
      statusCode: 400,
      statusMessage: "Это время пересекается с другим занятием"
    });
  }
}
import { prisma } from "./prisma";
import { getUserIdFromSession } from "./session";

export async function requireAdminUser(event: any) {
  const userId = getUserIdFromSession(event);

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Требуется авторизация"
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    }
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Пользователь не найден"
    });
  }

  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      statusMessage: "Нет доступа"
    });
  }

  return user;
}
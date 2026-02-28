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

  const fullName = String(body.fullName || "").trim();
  const contacts = String(body.contacts || "").trim();

  if (!fullName) {
    throw createError({
      statusCode: 400,
      statusMessage: "ФИО не может быть пустым"
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName,
      contacts: contacts || null
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      contacts: true
    }
  });

  return {
    ok: true,
    user: updatedUser
  };
});
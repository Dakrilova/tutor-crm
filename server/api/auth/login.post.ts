import { prisma } from "../../utils/prisma";
import { verifyPassword } from "../../utils/auth";
import { setUserSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Введите email и пароль"
    });
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Неверный email или пароль"
    });
  }

  const isValid = verifyPassword(password, user.passwordHash);

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Неверный email или пароль"
    });
  }

  setUserSession(event, user.id);

  return {
    ok: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      contacts: user.contacts,
      role: user.role
    }
  };
});
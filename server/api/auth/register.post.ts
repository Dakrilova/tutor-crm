import { prisma } from "../../utils/prisma";
import { hashPassword } from "../../utils/auth";
import { setUserSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!fullName || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Заполните все поля"
    });
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: "Пароль должен быть не короче 6 символов"
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "Пользователь с таким email уже существует"
    });
  }

  const passwordHash = hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash
    }
  });

  setUserSession(event, user.id);

  return {
    ok: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email
    }
  };
});
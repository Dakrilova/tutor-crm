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
    materialId?: number;
  }>(event);

  const lessonId = Number(body.lessonId);
  const materialId = Number(body.materialId);

  if (!Number.isFinite(lessonId) || lessonId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный ID занятия"
    });
  }

  if (!Number.isFinite(materialId) || materialId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный ID материала"
    });
  }

  const material = await prisma.lessonMaterial.findFirst({
    where: {
      id: materialId,
      lessonId,
      lesson: {
        userId
      }
    }
  });

  if (!material) {
    throw createError({
      statusCode: 404,
      statusMessage: "Материал не найден"
    });
  }

  await prisma.lessonMaterial.delete({
    where: {
      id: materialId
    }
  });

  return {
    ok: true,
    deletedId: materialId
  };
});
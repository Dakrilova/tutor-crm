import { prisma } from "../../utils/prisma";
import { getUserIdFromSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromSession(event);

  if (!userId) {
    return {
      authenticated: false,
      user: null
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      contacts: true
    }
  });

  if (!user) {
    return {
      authenticated: false,
      user: null
    };
  }

  return {
    authenticated: true,
    user
  };
});
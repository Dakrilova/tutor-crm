export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();

  if (!auth.user) {
    await auth.fetchMe();
  }

  if (!auth.authenticated) {
    return navigateTo("/login");
  }

  if (auth.user?.role !== "ADMIN") {
    return navigateTo("/board");
  }
});
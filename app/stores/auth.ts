export const useAuthStore = defineStore("auth", () => {
  const user = ref<null | {
    id: number
    fullName: string
    email: string
    contacts?: string | null
  }>(null)

  const authenticated = computed(() => !!user.value)
  const loading = ref(false)

  async function fetchMe() {
    loading.value = true

    try {
      const headers = process.server
        ? useRequestHeaders(["cookie"])
        : undefined

      const response = await $fetch("/api/auth/me", {
        headers
      })

      if (response.authenticated) {
        user.value = response.user
      } else {
        user.value = null
      }
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await $fetch("/api/auth/logout", {
      method: "POST"
    })

    user.value = null
    await navigateTo("/login")
  }

  function setUser(newUser: {
    id: number
    fullName: string
    email: string
    contacts?: string | null
  } | null) {
    user.value = newUser
  }

  return {
    user,
    authenticated,
    loading,
    fetchMe,
    logout,
    setUser
  }
})
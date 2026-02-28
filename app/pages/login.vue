<script setup lang="ts">
const form = reactive({
  email: "",
  password: ""
})

const loading = ref(false)
const errorMessage = ref("")

async function submitLogin() {
  errorMessage.value = ""
  loading.value = true

  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: form
    })

    const auth = useAuthStore()
    await auth.fetchMe()

    await navigateTo("/board")
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage || "Ошибка при входе"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container max-w-xl">
    <div class="panel p-6">
      <h1 class="text-3xl font-bold mb-2">Вход</h1>
      <p class="muted mb-6">Войди в аккаунт преподавателя</p>

      <div class="space-y-4">
        <div class="field-group">
          <label class="field-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="field-input"
            placeholder="mail@example.com"
          >
        </div>

        <div class="field-group">
          <label class="field-label">Пароль</label>
          <input
            v-model="form.password"
            type="password"
            class="field-input"
            placeholder="Введите пароль"
          >
        </div>

        <p v-if="errorMessage" class="text-sm text-red-400">
          {{ errorMessage }}
        </p>

        <div class="flex gap-3 pt-2">
          <UButton :loading="loading" @click="submitLogin">
            Войти
          </UButton>

          <NuxtLink to="/register">
            <UButton variant="outline">
              Регистрация
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
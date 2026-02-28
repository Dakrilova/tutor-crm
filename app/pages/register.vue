<script setup lang="ts">
const form = reactive({
  fullName: "",
  email: "",
  password: ""
})

const loading = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

async function submitRegister() {
  errorMessage.value = ""
  successMessage.value = ""
  loading.value = true

  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: form
    })

    const auth = useAuthStore()
    await auth.fetchMe()

    successMessage.value = "Регистрация успешна"
    await navigateTo("/board")
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage || "Ошибка при регистрации"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container max-w-xl">
    <div class="panel p-6">
      <h1 class="text-3xl font-bold mb-2">Регистрация</h1>
      <p class="muted mb-6">Создай аккаунт преподавателя</p>

      <div class="space-y-4">
        <div class="field-group">
          <label class="field-label">ФИО</label>
          <input
            v-model="form.fullName"
            type="text"
            class="field-input"
            placeholder="Иванов Иван Иванович"
          >
        </div>

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
            placeholder="Минимум 6 символов"
          >
        </div>

        <p v-if="errorMessage" class="text-sm text-red-400">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="text-sm text-green-400">
          {{ successMessage }}
        </p>

        <div class="flex gap-3 pt-2">
          <UButton :loading="loading" @click="submitRegister">
            Зарегистрироваться
          </UButton>

          <NuxtLink to="/login">
            <UButton variant="outline">
              Уже есть аккаунт
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
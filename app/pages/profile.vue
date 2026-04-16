<script setup lang="ts">
definePageMeta({
  middleware: "auth"
})

const auth = useAuthStore()

const form = reactive({
  fullName: "",
  contacts: ""
})

const loading = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const teacherSubtitle = computed(() => {
  return `Преподаватель: <strong>${auth.user?.fullName || "—"}</strong>`
})

watch(
  () => auth.user,
  (user) => {
    if (user) {
      form.fullName = user.fullName || ""
      form.contacts = user.contacts || ""
    }
  },
  { immediate: true }
)

async function saveProfile() {
  errorMessage.value = ""
  successMessage.value = ""
  loading.value = true

  try {
    const response = await $fetch("/api/profile/update", {
      method: "PATCH",
      body: {
        fullName: form.fullName,
        contacts: form.contacts
      }
    })

    auth.setUser(response.user)
    successMessage.value = "Профиль успешно сохранен"
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage || "Ошибка при сохранении профиля"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppHeader
    title="Профиль"
    :subtitle="teacherSubtitle"
  >
    <template #actions>
      <NuxtLink to="/board" class="btn-secondary">
        К доске
      </NuxtLink>

      <NuxtLink to="/courses" class="btn-secondary">
        Курсы
      </NuxtLink>

      <button class="btn-secondary" type="button" @click="auth.logout">
        Выйти
      </button>
    </template>
  </AppHeader>

  <div class="page-container" style="max-width: 980px;">
    <div class="panel p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-2">Профиль преподавателя</h1>
        <p class="muted">
          Управление личными данными аккаунта
        </p>
      </div>

      <div class="card-ui p-5 space-y-5">
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
          <label class="field-label">Контакты</label>
          <textarea
            v-model="form.contacts"
            class="field-textarea"
            rows="5"
            placeholder="Телефон, Telegram, email, удобное время для связи"
          ></textarea>
        </div>

        <div class="field-group">
          <label class="field-label">Email</label>
          <input
            :value="auth.user?.email || ''"
            type="text"
            class="field-input"
            readonly
          >
        </div>

        <p v-if="errorMessage" class="text-sm text-red-400">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="text-sm text-green-400">
          {{ successMessage }}
        </p>

        <div class="flex flex-wrap gap-3 pt-2">
          <button
            class="btn-primary"
            type="button"
            :disabled="loading"
            @click="saveProfile"
          >
            {{ loading ? "Сохраняем..." : "Сохранить" }}
          </button>

          <NuxtLink to="/board" class="btn-secondary">
            К доске
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
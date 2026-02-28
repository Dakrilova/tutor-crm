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
  <div class="page-container max-w-3xl">
    <div class="panel p-6">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold mb-2">Профиль преподавателя</h1>
          <p class="muted">
            Управление личными данными аккаунта
          </p>
        </div>

        <UButton variant="outline" @click="auth.logout">
          Выйти
        </UButton>
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

        <div class="flex gap-3 pt-2">
          <UButton :loading="loading" @click="saveProfile">
            Сохранить
          </UButton>

          <NuxtLink to="/board">
            <UButton variant="outline">
              К доске
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue"

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
    const response: any = await $fetch("/api/profile/update", {
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
  <template #primary-actions>
  <button
    class="btn-primary"
    type="button"
    :disabled="loading"
    @click="saveProfile"
  >
    {{ loading ? "Сохраняем..." : "Сохранить" }}
  </button>
</template>
  </AppHeader>

  <div class="page-container profile-page-container">
    <div class="panel profile-panel">
      <div class="profile-head">
        <h1 class="section-title">Профиль преподавателя</h1>
        <p class="section-subtitle">
          Управление личными данными аккаунта
        </p>
      </div>

      <div class="card-ui profile-card">
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

        <p v-if="errorMessage" class="profile-error">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="profile-success">
          {{ successMessage }}
        </p>

        <div class="profile-actions">
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

<style scoped>
.profile-page-container {
  max-width: 980px;
}

.profile-panel {
  padding: 24px;
}

.profile-head {
  margin-bottom: 24px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.profile-error {
  margin: 0;
  color: #f87171;
  font-size: 14px;
}

.profile-success {
  margin: 0;
  color: #4ade80;
  font-size: 14px;
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 8px;
}

@media (max-width: 640px) {
  .profile-panel {
    padding: 18px;
  }

  .profile-card {
    padding: 16px;
  }

  .profile-actions {
    flex-direction: column;
  }

  .profile-actions .btn-primary,
  .profile-actions .btn-secondary {
    width: 100%;
  }
}
</style>
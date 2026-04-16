<script setup lang="ts">
import AppHeader from "~/components/AppHeader.vue"
import CreateEntryModal from "~/components/forms/CreateEntryModal.vue"

definePageMeta({
  middleware: "auth"
})

const auth = useAuthStore()
const coursesStore = useCoursesStore()

const teacherSubtitle = computed(() => {
  return `Преподаватель: <strong>${auth.user?.fullName || "—"}</strong>`
})

const isCreateModalOpen = ref(false)

await callOnce("courses-page", async () => {
  await coursesStore.fetchCourses()
})
</script>

<template>
  <AppHeader
    title="Курсы"
    :subtitle="teacherSubtitle"
  >
    <template #actions>
      <button
        class="btn-primary"
        type="button"
        @click="isCreateModalOpen = true"
      >
        + Создать курс
      </button>

      <NuxtLink to="/board" class="btn-secondary">
        К доске
      </NuxtLink>

      <NuxtLink to="/profile" class="btn-secondary">
        Профиль
      </NuxtLink>

      <button class="btn-secondary" type="button" @click="auth.logout">
        Выйти
      </button>
    </template>
  </AppHeader>

  <div class="page-container">
    <div v-if="coursesStore.loading" class="panel p-6">
      Загружаем курсы...
    </div>

    <div v-else-if="coursesStore.items.length === 0" class="panel p-6">
      <p class="muted">Курсов пока нет</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="course in coursesStore.items"
        :key="course.id"
        class="panel p-5"
      >
        <div class="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 class="text-xl font-semibold mb-1">
              {{ course.title }}
            </h2>

            <p class="muted text-sm">
              {{ course.targetName || "Без ученика / группы" }}
            </p>
          </div>

          <div class="lesson-type-badge">
            {{ course.lessons?.length || 0 }} уроков
          </div>
        </div>

        <div class="card-ui p-4">
          <p class="text-sm mb-2">
            <span class="muted">ID курса:</span> {{ course.id }}
          </p>

          <p class="text-sm">
            <span class="muted">Ближайшая задача:</span>
            {{
              course.lessons && course.lessons.length
                ? "есть уроки в курсе"
                : "уроки пока не добавлены"
            }}
          </p>
        </div>

        <div class="mt-4">
          <NuxtLink :to="`/courses/${course.id}`" class="btn-secondary">
            Открыть курс
          </NuxtLink>
        </div>
      </div>
    </div>

    <CreateEntryModal
      v-model:open="isCreateModalOpen"
      initial-mode="course"
    />
  </div>
</template>
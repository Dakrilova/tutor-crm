<script setup lang="ts">
definePageMeta({
  middleware: "auth"
})

const auth = useAuthStore()
const coursesStore = useCoursesStore()

await callOnce("courses-page", async () => {
  await coursesStore.fetchCourses()
})
</script>

<template>
  <div class="page-container">
    <div class="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2">Курсы</h1>
        <p class="muted">
          Преподаватель: {{ auth.user?.fullName }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/board">
          <UButton variant="outline">
            К доске
          </UButton>
        </NuxtLink>

        <NuxtLink to="/profile">
          <UButton variant="outline">
            Профиль
          </UButton>
        </NuxtLink>

        <UButton variant="outline" @click="auth.logout">
          Выйти
        </UButton>
      </div>
    </div>

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

          <UBadge variant="soft">
            {{ course.lessons?.length || 0 }} уроков
          </UBadge>
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
        <NuxtLink :to="`/courses/${course.id}`">
            <UButton variant="outline" size="sm">
            Открыть курс
            </UButton>
        </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
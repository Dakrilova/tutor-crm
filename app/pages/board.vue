<script setup lang="ts">
import BoardColumn from "../components/board/BoardColumn.vue"
import CreateEntryModal from "../components/forms/CreateEntryModal.vue"
import EditLessonModal from "../components/forms/EditLessonModal.vue"

definePageMeta({
  middleware: "auth"
})

const auth = useAuthStore()
const lessonsStore = useLessonsStore()

const columns = [
  { key: "FREE", title: "Свободные" },
  { key: "RESERVED", title: "Забронированные" },
  { key: "PAID", title: "Оплаченные" },
  { key: "IN_PROGRESS", title: "В работе" },
  { key: "DONE", title: "Завершенные" }
] as const

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedLesson = ref<any | null>(null)
const movingLessonId = ref<number | null>(null)

const filters = reactive({
  date: "",
  search: "",
  kind: "all" as "all" | "single" | "course"
})

function openEditLesson(lesson: any) {
  selectedLesson.value = lesson
  isEditModalOpen.value = true
}

function clearFilters() {
  filters.date = ""
  filters.search = ""
  filters.kind = "all"
}

const filteredLessons = computed(() => {
  return lessonsStore.getFilteredItems(filters)
})

const lessonsByStatus = computed(() => {
  return {
    FREE: filteredLessons.value.filter(item => item.status === "FREE"),
    RESERVED: filteredLessons.value.filter(item => item.status === "RESERVED"),
    PAID: filteredLessons.value.filter(item => item.status === "PAID"),
    IN_PROGRESS: filteredLessons.value.filter(item => item.status === "IN_PROGRESS"),
    DONE: filteredLessons.value.filter(item => item.status === "DONE")
  }
})

async function handleDropLesson(payload: {
  lessonId: number
  status: "FREE" | "RESERVED" | "PAID" | "IN_PROGRESS" | "DONE"
}) {
  if (movingLessonId.value === payload.lessonId) {
    return
  }

  const lesson = lessonsStore.items.find(item => item.id === payload.lessonId)

  if (!lesson) {
    return
  }

  if (lesson.status === payload.status) {
    return
  }

  try {
    movingLessonId.value = payload.lessonId
    await lessonsStore.updateLessonStatus(payload.lessonId, payload.status)
  } catch (error) {
    console.error("MOVE LESSON ERROR", error)
  } finally {
    movingLessonId.value = null
  }
}

await callOnce("lessons-board", async () => {
  await lessonsStore.fetchLessons()
})
</script>

<template>
  <div class="page-container">
    <div class="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2">Доска занятий</h1>
        <p class="muted">
          Преподаватель: {{ auth.user?.fullName }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton @click="isCreateModalOpen = true">
          + Создать
        </UButton>

        <NuxtLink to="/courses">
          <UButton variant="outline">
            Курсы
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

    <div class="panel p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="field-group">
          <label class="field-label">Дата</label>
          <input
            v-model="filters.date"
            type="date"
            class="field-input"
          >
        </div>

        <div class="field-group">
          <label class="field-label">Поиск</label>
          <input
            v-model="filters.search"
            type="text"
            class="field-input"
            placeholder="Название, ученик, курс..."
          >
        </div>

        <div class="field-group">
          <label class="field-label">Тип</label>
          <select v-model="filters.kind" class="field-select">
            <option value="all">Все</option>
            <option value="single">Только одиночные</option>
            <option value="course">Только уроки курса</option>
          </select>
        </div>

        <div class="flex items-end">
          <UButton variant="outline" @click="clearFilters">
            Сбросить
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="lessonsStore.loading" class="panel p-6">
      Загружаем занятия...
    </div>

    <div
      v-else
      class="grid grid-cols-1 xl:grid-cols-5 gap-4"
    >
      <BoardColumn
        v-for="column in columns"
        :key="column.key"
        :title="column.title"
        :status="column.key"
        :items="lessonsByStatus[column.key]"
        @edit="openEditLesson"
        @dropLesson="handleDropLesson"
      />
    </div>

    <CreateEntryModal v-model:open="isCreateModalOpen" />

    <EditLessonModal
      v-model:open="isEditModalOpen"
      :lesson="selectedLesson"
    />
  </div>
</template>
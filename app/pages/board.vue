<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue"
import BoardColumn from "../components/board/BoardColumn.vue"
import NotificationsModal from "../components/board/NotificationsModal.vue"
import ScheduleOverview from "../components/board/ScheduleOverview.vue"
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
const isScheduleModalOpen = ref(false)
const isNotificationsModalOpen = ref(false)

const selectedLesson = ref<any | null>(null)
const movingLessonId = ref<number | null>(null)

const filters = reactive({
  date: "",
  search: "",
  kind: "all" as "all" | "single" | "course"
})

const teacherSubtitle = computed(() => {
  return `Преподаватель: <strong>${auth.user?.fullName || "—"}</strong>`
})

function isPastLesson(lesson: any) {
  const endDate = new Date(lesson.endAt)

  if (Number.isNaN(endDate.getTime())) {
    return false
  }

  return endDate < new Date()
}

const filteredLessons = computed(() => {
  return lessonsStore.getFilteredItems(filters)
})

const boardLessons = computed(() => {
  return filteredLessons.value.filter(lesson => !isPastLesson(lesson))
})

const lessonsByStatus = computed(() => {
  return {
    FREE: boardLessons.value.filter(item => item.status === "FREE"),
    RESERVED: boardLessons.value.filter(item => item.status === "RESERVED"),
    PAID: boardLessons.value.filter(item => item.status === "PAID"),
    IN_PROGRESS: boardLessons.value.filter(item => item.status === "IN_PROGRESS"),
    DONE: boardLessons.value.filter(item => item.status === "DONE")
  }
})

const notificationsCount = computed(() => {
  const now = new Date()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  function toDateKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const todayKey = toDateKey(today)
  const tomorrowKey = toDateKey(tomorrow)

  const activeLessons = lessonsStore.items.filter((lesson) => {
    const endDate = new Date(lesson.endAt)
    return Number.isNaN(endDate.getTime()) || endDate >= now
  })

  const pastLessons = lessonsStore.items.filter((lesson) => {
    const endDate = new Date(lesson.endAt)
    return !Number.isNaN(endDate.getTime()) && endDate < now
  })

  const todayLessons = activeLessons.filter((lesson) => {
    const startDate = new Date(lesson.startAt)
    return !Number.isNaN(startDate.getTime()) && toDateKey(startDate) === todayKey
  })

  const tomorrowLessons = activeLessons.filter((lesson) => {
    const startDate = new Date(lesson.startAt)
    return !Number.isNaN(startDate.getTime()) && toDateKey(startDate) === tomorrowKey
  })

  const lessonsWithoutMaterials = activeLessons.filter((lesson) => {
    return !lesson.materials || lesson.materials.length === 0
  })

  const lessonsWithoutLinks = activeLessons.filter((lesson) => {
    const statusesWithLink = ["RESERVED", "PAID", "IN_PROGRESS"]
    return statusesWithLink.includes(lesson.status) && !lesson.linkUrl
  })

  let count = 0

  if (todayLessons.length) count++
  if (tomorrowLessons.length) count++
  if (lessonsWithoutMaterials.length) count++
  if (lessonsWithoutLinks.length) count++
  if (pastLessons.length) count++

  return count
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
  <AppHeader
    title="Доска занятий"
    :subtitle="teacherSubtitle"
  >
    <template #actions>
      <button class="btn-primary" type="button" @click="isCreateModalOpen = true">
        + Создать
      </button>

      <button class="btn-secondary btn-with-badge" type="button" @click="isNotificationsModalOpen = true">
        Уведомления
        <span v-if="notificationsCount" class="button-badge">
          {{ notificationsCount }}
        </span>
      </button>

      <button class="btn-secondary" type="button" @click="isScheduleModalOpen = true">
        Расписание
      </button>

      <NuxtLink to="/courses" class="btn-secondary">
        Курсы
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
          <button class="btn-secondary" type="button" @click="clearFilters">
            Сбросить
          </button>
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

    <ScheduleOverview
      v-model:open="isScheduleModalOpen"
      :lessons="lessonsStore.items"
    />

    <NotificationsModal
      v-model:open="isNotificationsModalOpen"
      :lessons="lessonsStore.items"
    />
  </div>
</template>
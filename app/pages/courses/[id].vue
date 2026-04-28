<script setup lang="ts">
import AppHeader from "~/components/AppHeader.vue"
import AddCourseLessonModal from "../../components/forms/AddCourseLessonModal.vue"
import EditLessonModal from "../../components/forms/EditLessonModal.vue"
import EditCourseModal from "../../components/forms/EditCourseModal.vue"

definePageMeta({
  middleware: "auth"
})

const auth = useAuthStore()
const route = useRoute()
const coursesStore = useCoursesStore()

const courseId = computed(() => Number(route.params.id))
const course = ref<any | null>(null)
const loading = ref(true)
const deleting = ref(false)
const errorMessage = ref("")

const isAddLessonModalOpen = ref(false)
const isEditLessonModalOpen = ref(false)
const isEditCourseModalOpen = ref(false)
const selectedLesson = ref<any | null>(null)

const teacherSubtitle = computed(() => {
  return `Преподаватель: <strong>${auth.user?.fullName || "—"}</strong>`
})

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)
}

function getStatusLabel(status: string) {
  switch (status) {
    case "FREE":
      return "Свободно"
    case "RESERVED":
      return "Забронировано"
    case "PAID":
      return "Оплачено"
    case "IN_PROGRESS":
      return "В работе"
    case "DONE":
      return "Завершено"
    default:
      return status
  }
}

async function fetchCourse() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await $fetch<{
      ok: boolean
      course: any
    }>(`/api/courses/${courseId.value}`)

    course.value = response.course
  } catch (error: any) {
    console.error("FETCH COURSE ERROR", error)

    errorMessage.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Ошибка при загрузке курса"
  } finally {
    loading.value = false
  }
}

async function removeCourse() {
  if (!course.value?.id) {
    return
  }

  const confirmed = window.confirm("Удалить курс и все его уроки?")

  if (!confirmed) {
    return
  }

  deleting.value = true
  errorMessage.value = ""

  try {
    await coursesStore.deleteCourse(course.value.id)
    await navigateTo("/courses")
  } catch (error: any) {
    console.error("DELETE COURSE ERROR", error)

    errorMessage.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Ошибка при удалении курса"
  } finally {
    deleting.value = false
  }
}

async function handleLessonCreated() {
  await fetchCourse()
}

function openEditLesson(lesson: any) {
  selectedLesson.value = lesson
  isEditLessonModalOpen.value = true
}

watch(isEditLessonModalOpen, async (value) => {
  if (!value && selectedLesson.value) {
    await fetchCourse()
    selectedLesson.value = null
  }
})

watch(isEditCourseModalOpen, async (value) => {
  if (!value) {
    await fetchCourse()
  }
})

onMounted(() => {
  fetchCourse()
})
</script>

<template>
  <AppHeader
    :title="course?.title || 'Курс'"
    :subtitle="teacherSubtitle"
  >
    <template #primary-actions>
      <button
        class="btn-primary"
        type="button"
        @click="isAddLessonModalOpen = true"
      >
        + Добавить урок
      </button>

      <button
        class="btn-secondary"
        type="button"
        @click="isEditCourseModalOpen = true"
      >
        Редактировать курс
      </button>

      <NuxtLink to="/courses" class="btn-secondary">
        К списку
      </NuxtLink>
    </template>
  </AppHeader>

  <div class="page-container">
    <div v-if="loading" class="panel p-6">
      Загружаем курс...
    </div>

    <div v-else-if="errorMessage" class="panel p-6">
      <p class="text-red-400">{{ errorMessage }}</p>
    </div>

    <template v-else-if="course">
      <div class="panel p-5 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p class="text-sm muted mb-1">Название курса</p>
            <p class="text-xl font-semibold mb-3">{{ course.title }}</p>

            <p class="text-sm muted mb-1">Ученик / группа</p>
            <p>{{ course.targetName || "Не указано" }}</p>
          </div>

          <div class="flex flex-col items-start lg:items-end gap-3">
            <div class="lesson-type-badge">
              {{ course.lessons?.length || 0 }} уроков
            </div>

            <button
              class="btn-danger"
              type="button"
              :disabled="deleting"
              @click="removeCourse"
            >
              {{ deleting ? "Удаляем..." : "Удалить курс" }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="!course.lessons?.length" class="panel p-6">
        <p class="muted">В этом курсе пока нет уроков</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="lesson in course.lessons"
          :key="lesson.id"
          class="lesson-card card-ui cursor-pointer"
          @click="openEditLesson(lesson)"
        >
          <div class="lesson-card-head">
            <h2 class="lesson-card-title text-safe-wrap">
              {{ lesson.title }}
            </h2>

            <span class="lesson-type-badge">
              {{ getStatusLabel(lesson.status) }}
            </span>
          </div>

          <div class="lesson-card-time">
            <div class="text-safe-wrap">{{ formatDate(lesson.startAt) }}</div>
            <div class="muted text-safe-wrap">{{ formatDate(lesson.endAt) }}</div>
          </div>
        </div>
      </div>
    </template>

    <AddCourseLessonModal
      v-model:open="isAddLessonModalOpen"
      :course-id="courseId"
      :course-title="course?.title"
      @created="handleLessonCreated"
    />

    <EditLessonModal
      v-model:open="isEditLessonModalOpen"
      :lesson="selectedLesson"
    />

    <EditCourseModal
      v-model:open="isEditCourseModalOpen"
      :course="course"
    />
  </div>
</template>


<style scoped>
.lesson-card {
  display: flex;
  flex-direction: column;
  min-height: 120px;
  padding: 16px;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.lesson-card:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 220, 130, 0.22);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
}

.lesson-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  margin-bottom: 12px;
}

.lesson-card-title {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
}

.lesson-type-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(0, 220, 130, 0.18);
  border-radius: 10px;
  background: rgba(0, 220, 130, 0.1);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
}

.lesson-card-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  margin-top: auto;
  font-size: 14px;
  line-height: 1.5;
}
</style>
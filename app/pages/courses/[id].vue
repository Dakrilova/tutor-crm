<script setup lang="ts">
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
  <div class="page-container">
    <div class="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2">
          {{ course?.title || "Курс" }}
        </h1>
        <p class="muted">
          Преподаватель: {{ auth.user?.fullName }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton @click="isAddLessonModalOpen = true">
          + Добавить урок
        </UButton>

        <UButton variant="outline" @click="isEditCourseModalOpen = true">
          Редактировать курс
        </UButton>

        <NuxtLink to="/courses">
          <UButton variant="outline">
            К списку курсов
          </UButton>
        </NuxtLink>

        <NuxtLink to="/board">
          <UButton variant="outline">
            К доске
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="panel p-6">
      Загружаем курс...
    </div>

    <div v-else-if="errorMessage" class="panel p-6">
      <p class="text-red-400">{{ errorMessage }}</p>
    </div>

    <template v-else-if="course">
      <div class="panel p-5 mb-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm muted mb-1">Название курса</p>
            <p class="text-xl font-semibold mb-3">{{ course.title }}</p>

            <p class="text-sm muted mb-1">Ученик / группа</p>
            <p>{{ course.targetName || "Не указано" }}</p>
          </div>

          <div class="flex flex-col items-end gap-3">
            <UBadge variant="soft">
              {{ course.lessons?.length || 0 }} уроков
            </UBadge>

            <UButton
              color="error"
              variant="outline"
              :loading="deleting"
              @click="removeCourse"
            >
              Удалить курс
            </UButton>
          </div>
        </div>
      </div>

      <div v-if="!course.lessons?.length" class="panel p-6">
        <p class="muted">В этом курсе пока нет уроков</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="lesson in course.lessons"
          :key="lesson.id"
          class="card-ui p-4 cursor-pointer hover:scale-[1.01] transition"
          @click="openEditLesson(lesson)"
        >
          <div class="flex items-start justify-between gap-3 mb-2">
            <h2 class="font-semibold">{{ lesson.title }}</h2>

            <UBadge variant="soft">
              {{ lesson.status }}
            </UBadge>
          </div>

          <p class="muted text-sm mb-2">
            {{ formatDate(lesson.startAt) }} — {{ formatDate(lesson.endAt) }}
          </p>

          <p class="text-sm">
            {{ lesson.isPaid ? "Оплачено" : "Не оплачено" }}
          </p>
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
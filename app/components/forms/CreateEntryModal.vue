<script setup lang="ts">
import LessonMaterialsModal from "@/components/forms/LessonMaterialsModal.vue"

const props = withDefaults(defineProps<{
  initialMode?: "single" | "course" | "course-lesson"
}>(), {
  initialMode: "single"
})

const open = defineModel<boolean>("open", { default: false })

const lessonsStore = useLessonsStore()
const coursesStore = useCoursesStore()

const mode = ref<"single" | "course" | "course-lesson">(props.initialMode)

const singleForm = reactive({
  title: "",
  targetName: "",
  lessonDate: "",
  startTime: "08:00",
  endTime: "09:00",
  status: "FREE" as "FREE" | "RESERVED" | "PAID" | "IN_PROGRESS" | "DONE",
  isPaid: false,
  linkUrl: ""
})

const courseForm = reactive({
  title: "",
  targetName: ""
})

const courseLessonForm = reactive({
  courseId: "",
  title: "",
  lessonDate: "",
  startTime: "08:00",
  endTime: "09:00",
  status: "FREE" as "FREE" | "RESERVED" | "PAID" | "IN_PROGRESS" | "DONE",
  isPaid: false,
  linkUrl: ""
})

const loading = ref(false)
const errorMessage = ref("")

const materialsModalOpen = ref(false)
const createdLessonForMaterials = ref<any | null>(null)

function resetAll() {
  mode.value = props.initialMode

  singleForm.title = ""
  singleForm.targetName = ""
  singleForm.lessonDate = ""
  singleForm.startTime = "08:00"
  singleForm.endTime = "09:00"
  singleForm.status = "FREE"
  singleForm.isPaid = false
  singleForm.linkUrl = ""

  courseForm.title = ""
  courseForm.targetName = ""

  courseLessonForm.courseId = ""
  courseLessonForm.title = ""
  courseLessonForm.lessonDate = ""
  courseLessonForm.startTime = "08:00"
  courseLessonForm.endTime = "09:00"
  courseLessonForm.status = "FREE"
  courseLessonForm.isPaid = false
  courseLessonForm.linkUrl = ""

  errorMessage.value = ""
}

function toDateInputString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const minDate = new Date()
const maxDate = new Date()
maxDate.setFullYear(maxDate.getFullYear() + 1)

const minDateValue = computed(() => toDateInputString(minDate))
const maxDateValue = computed(() => toDateInputString(maxDate))

function buildDateTime(dateValue: string, timeValue: string) {
  return `${dateValue}T${timeValue}`
}

function isEndTimeLater(startTime: string, endTime: string) {
  return endTime > startTime
}

watch(open, async (value) => {
  if (value) {
    mode.value = props.initialMode
    await coursesStore.fetchCourses()
  } else {
    resetAll()
  }
})

async function openMaterialsForCreatedLesson(lesson: any) {
  createdLessonForMaterials.value = {
    ...lesson,
    materials: lesson.materials || []
  }

  open.value = false

  await nextTick()

  materialsModalOpen.value = true
}

async function submit() {
  errorMessage.value = ""
  loading.value = true

  try {
    if (mode.value === "single") {
      if (!singleForm.title.trim()) {
        errorMessage.value = "Введите название занятия"
        loading.value = false
        return
      }

      if (!singleForm.lessonDate) {
        errorMessage.value = "Выберите дату занятия"
        loading.value = false
        return
      }

      if (!isEndTimeLater(singleForm.startTime, singleForm.endTime)) {
        errorMessage.value = "Время окончания должно быть позже времени начала"
        loading.value = false
        return
      }

      const createdLesson = await lessonsStore.createSingleLesson({
        title: singleForm.title,
        targetName: singleForm.targetName,
        startAt: buildDateTime(singleForm.lessonDate, singleForm.startTime),
        endAt: buildDateTime(singleForm.lessonDate, singleForm.endTime),
        status: singleForm.status,
        isPaid: singleForm.isPaid,
        linkUrl: singleForm.linkUrl
      })

      await openMaterialsForCreatedLesson(createdLesson)
      return
    }

    if (mode.value === "course") {
      if (!courseForm.title.trim()) {
        errorMessage.value = "Введите название курса"
        loading.value = false
        return
      }

      await coursesStore.createCourse({
        title: courseForm.title,
        targetName: courseForm.targetName
      })

      await coursesStore.fetchCourses()
      open.value = false
      return
    }

    if (mode.value === "course-lesson") {
      if (!courseLessonForm.courseId) {
        errorMessage.value = "Выберите курс"
        loading.value = false
        return
      }

      if (!courseLessonForm.title.trim()) {
        errorMessage.value = "Введите название урока"
        loading.value = false
        return
      }

      if (!courseLessonForm.lessonDate) {
        errorMessage.value = "Выберите дату урока"
        loading.value = false
        return
      }

      if (!isEndTimeLater(courseLessonForm.startTime, courseLessonForm.endTime)) {
        errorMessage.value = "Время окончания должно быть позже времени начала"
        loading.value = false
        return
      }

      const createdLesson = await lessonsStore.createCourseLesson({
        courseId: Number(courseLessonForm.courseId),
        title: courseLessonForm.title,
        startAt: buildDateTime(courseLessonForm.lessonDate, courseLessonForm.startTime),
        endAt: buildDateTime(courseLessonForm.lessonDate, courseLessonForm.endTime),
        status: courseLessonForm.status,
        isPaid: courseLessonForm.isPaid,
        linkUrl: courseLessonForm.linkUrl
      })

      await openMaterialsForCreatedLesson(createdLesson)
    }
  } catch (error: any) {
    console.error("CREATE ENTRY ERROR", error)
    errorMessage.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Ошибка при создании"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Создать запись"
    description="Одиночное занятие, курс или урок курса"
    :ui="{ content: 'bg-transparent shadow-none ring-0 overflow-visible' }"
  >
    <template #content>
      <div class="panel p-6 rounded-2xl overflow-hidden">
        <div class="mb-6">
          <h2 class="text-2xl font-semibold mb-1">Создать запись</h2>
          <p class="muted text-sm">Одиночное занятие, курс или урок курса</p>
        </div>

        <div class="field-group mb-6">
          <label class="field-label">Тип записи</label>
          <select v-model="mode" class="field-select">
            <option value="single">Одиночное занятие</option>
            <option value="course">Курс</option>
            <option value="course-lesson">Урок курса</option>
          </select>
        </div>

        <div v-if="mode === 'single'" class="space-y-4">
          <div class="field-group">
            <label class="field-label">Название занятия</label>
            <input v-model="singleForm.title" type="text" class="field-input">
          </div>

          <div class="field-group">
            <label class="field-label">Ученик или группа</label>
            <input v-model="singleForm.targetName" type="text" class="field-input">
          </div>

          <div class="field-group">
            <label class="field-label">Дата</label>
            <input
              v-model="singleForm.lessonDate"
              type="date"
              class="field-input"
              :min="minDateValue"
              :max="maxDateValue"
            >
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field-group">
              <label class="field-label">Начало</label>
              <input
                v-model="singleForm.startTime"
                type="time"
                class="field-input"
                min="08:00"
                max="22:00"
              >
            </div>

            <div class="field-group">
              <label class="field-label">Конец</label>
              <input
                v-model="singleForm.endTime"
                type="time"
                class="field-input"
                min="08:00"
                max="22:00"
              >
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Статус</label>
            <select v-model="singleForm.status" class="field-select">
              <option value="FREE">Свободное</option>
              <option value="RESERVED">Забронировано</option>
              <option value="PAID">Оплачено</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="DONE">Завершено</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Ссылка</label>
            <input
              v-model="singleForm.linkUrl"
              type="text"
              class="field-input"
              placeholder="https://..."
            >
          </div>

          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="singleForm.isPaid" type="checkbox">
            <span>Отмечено как оплаченное</span>
          </label>
        </div>

        <div v-else-if="mode === 'course'" class="space-y-4">
          <div class="field-group">
            <label class="field-label">Название курса</label>
            <input v-model="courseForm.title" type="text" class="field-input">
          </div>

          <div class="field-group">
            <label class="field-label">Ученик или группа</label>
            <input v-model="courseForm.targetName" type="text" class="field-input">
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="field-group">
            <label class="field-label">Курс</label>
            <select v-model="courseLessonForm.courseId" class="field-select">
              <option value="" disabled>Выбери курс</option>
              <option
                v-for="course in coursesStore.items"
                :key="course.id"
                :value="String(course.id)"
              >
                {{ course.targetName ? `${course.title} — ${course.targetName}` : course.title }}
              </option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Название урока</label>
            <input v-model="courseLessonForm.title" type="text" class="field-input">
          </div>

          <div class="field-group">
            <label class="field-label">Дата</label>
            <input
              v-model="courseLessonForm.lessonDate"
              type="date"
              class="field-input"
              :min="minDateValue"
              :max="maxDateValue"
            >
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field-group">
              <label class="field-label">Начало</label>
              <input
                v-model="courseLessonForm.startTime"
                type="time"
                class="field-input"
                min="08:00"
                max="22:00"
              >
            </div>

            <div class="field-group">
              <label class="field-label">Конец</label>
              <input
                v-model="courseLessonForm.endTime"
                type="time"
                class="field-input"
                min="08:00"
                max="22:00"
              >
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Статус</label>
            <select v-model="courseLessonForm.status" class="field-select">
              <option value="FREE">Свободное</option>
              <option value="RESERVED">Забронировано</option>
              <option value="PAID">Оплачено</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="DONE">Завершено</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Ссылка</label>
            <input
              v-model="courseLessonForm.linkUrl"
              type="text"
              class="field-input"
              placeholder="https://..."
            >
          </div>

          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="courseLessonForm.isPaid" type="checkbox">
            <span>Отмечено как оплаченное</span>
          </label>
        </div>

        <p v-if="errorMessage" class="text-sm text-red-400 mt-4">
          {{ errorMessage }}
        </p>

        <div class="flex justify-end gap-3 pt-5">
          <button class="btn-secondary" type="button" @click="open = false">
            Отмена
          </button>

          <button
            class="btn-primary"
            type="button"
            :disabled="loading"
            @click="submit"
          >
            {{ loading ? "Создаем..." : "Создать" }}
          </button>
        </div>
      </div>
    </template>
  </UModal>

  <LessonMaterialsModal
    v-model:open="materialsModalOpen"
    :lesson="createdLessonForMaterials"
  />
</template>
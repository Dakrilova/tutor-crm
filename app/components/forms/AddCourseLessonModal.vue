<script setup lang="ts">
import LessonMaterialsModal from "@/components/forms/LessonMaterialsModal.vue"

const props = defineProps<{
  courseId: number
  courseTitle?: string
}>()

const open = defineModel<boolean>("open", { default: false })

const lessonsStore = useLessonsStore()

const form = reactive({
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

function resetForm() {
  form.title = ""
  form.lessonDate = ""
  form.startTime = "08:00"
  form.endTime = "09:00"
  form.status = "FREE"
  form.isPaid = false
  form.linkUrl = ""
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

const emit = defineEmits<{
  created: []
}>()

watch(open, (value) => {
  if (!value) {
    resetForm()
  }
})

async function submit() {
  errorMessage.value = ""
  loading.value = true

  try {
    if (!form.title.trim()) {
      errorMessage.value = "Введите название урока"
      loading.value = false
      return
    }

    if (!form.lessonDate) {
      errorMessage.value = "Выберите дату урока"
      loading.value = false
      return
    }

    if (!isEndTimeLater(form.startTime, form.endTime)) {
      errorMessage.value = "Время окончания должно быть позже времени начала"
      loading.value = false
      return
    }

    const createdLesson = await lessonsStore.createCourseLesson({
      courseId: props.courseId,
      title: form.title,
      startAt: buildDateTime(form.lessonDate, form.startTime),
      endAt: buildDateTime(form.lessonDate, form.endTime),
      status: form.status,
      isPaid: form.isPaid,
      linkUrl: form.linkUrl
    })

    createdLessonForMaterials.value = {
      ...createdLesson,
      materials: createdLesson.materials || []
    }

    emit("created")

    open.value = false

    await nextTick()

    materialsModalOpen.value = true
  } catch (error: any) {
    console.error("ADD COURSE LESSON ERROR", error)

    errorMessage.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Ошибка при создании урока"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Добавить урок"
    description="Добавление нового урока в текущий курс"
    :ui="{ content: 'bg-transparent shadow-none ring-0 overflow-visible' }"
  >
    <template #content>
      <div class="panel p-6 rounded-2xl modal-panel-scroll">
        <div class="mb-6">
          <h2 class="text-2xl font-semibold mb-1">Добавить урок</h2>
          <p class="muted text-sm">
            Курс: {{ courseTitle || `#${courseId}` }}
          </p>
        </div>

        <div class="space-y-4">
          <div class="field-group">
            <label class="field-label">Название урока</label>
            <input
              v-model="form.title"
              type="text"
              class="field-input"
              placeholder="Например, Урок 1"
            >
          </div>

          <div class="field-group">
            <label class="field-label">Дата</label>
            <input
              v-model="form.lessonDate"
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
                v-model="form.startTime"
                type="time"
                class="field-input"
                min="08:00"
                max="22:00"
              >
            </div>

            <div class="field-group">
              <label class="field-label">Конец</label>
              <input
                v-model="form.endTime"
                type="time"
                class="field-input"
                min="08:00"
                max="22:00"
              >
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Статус</label>
            <select v-model="form.status" class="field-select">
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
              v-model="form.linkUrl"
              type="text"
              class="field-input"
              placeholder="https://..."
            >
          </div>

          <p v-if="errorMessage" class="text-sm text-red-400">
            {{ errorMessage }}
          </p>

          <div class="flex justify-end gap-3 pt-3">
            <button class="btn-secondary" type="button" @click="open = false">
              Отмена
            </button>

            <button
              class="btn-primary"
              type="button"
              :disabled="loading"
              @click="submit"
            >
              {{ loading ? "Добавляем..." : "Добавить" }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </UModal>

  <LessonMaterialsModal
    v-model:open="materialsModalOpen"
    :lesson="createdLessonForMaterials"
  />
</template>
<script setup lang="ts">
const props = defineProps<{
  lesson: any | null
}>()

const open = defineModel<boolean>("open", { default: false })

const lessonsStore = useLessonsStore()

const form = reactive({
  id: 0,
  title: "",
  targetName: "",
  lessonDate: "",
  startTime: "08:00",
  endTime: "09:00",
  status: "FREE" as "FREE" | "RESERVED" | "PAID" | "IN_PROGRESS" | "DONE",
  isPaid: false,
  linkUrl: ""
})

const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref("")

function toDateInputString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toTimeInputString(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

function buildDateTime(dateValue: string, timeValue: string) {
  return `${dateValue}T${timeValue}`
}

function isEndTimeLater(startTime: string, endTime: string) {
  return endTime > startTime
}

watch(
  () => props.lesson,
  (lesson) => {
    if (!lesson) return

    const startDate = new Date(lesson.startAt)
    const endDate = new Date(lesson.endAt)

    form.id = lesson.id
    form.title = lesson.title || ""
    form.targetName = lesson.targetName || lesson.course?.targetName || ""
    form.lessonDate = Number.isNaN(startDate.getTime()) ? "" : toDateInputString(startDate)
    form.startTime = Number.isNaN(startDate.getTime()) ? "08:00" : toTimeInputString(startDate)
    form.endTime = Number.isNaN(endDate.getTime()) ? "09:00" : toTimeInputString(endDate)
    form.status = lesson.status || "FREE"
    form.isPaid = !!lesson.isPaid
    form.linkUrl = lesson.linkUrl || ""
    errorMessage.value = ""
  },
  { immediate: true }
)

async function submit() {
  errorMessage.value = ""
  loading.value = true

  try {
    if (!form.id) {
      errorMessage.value = "Урок не выбран"
      loading.value = false
      return
    }

    if (!form.title.trim()) {
      errorMessage.value = "Введите название занятия"
      loading.value = false
      return
    }

    if (!form.lessonDate) {
      errorMessage.value = "Выберите дату"
      loading.value = false
      return
    }

    if (!isEndTimeLater(form.startTime, form.endTime)) {
      errorMessage.value = "Время окончания должно быть позже времени начала"
      loading.value = false
      return
    }

    await lessonsStore.updateLesson({
      id: form.id,
      title: form.title,
      targetName: form.targetName,
      startAt: buildDateTime(form.lessonDate, form.startTime),
      endAt: buildDateTime(form.lessonDate, form.endTime),
      status: form.status,
      isPaid: form.isPaid,
      linkUrl: form.linkUrl
    })

    open.value = false
  } catch (error: any) {
    console.error("UPDATE LESSON ERROR", error)
    errorMessage.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Ошибка при сохранении"
  } finally {
    loading.value = false
  }
}

async function removeLesson() {
  if (!form.id) return

  const confirmed = window.confirm("Удалить это занятие?")

  if (!confirmed) return

  errorMessage.value = ""
  deleting.value = true

  try {
    await lessonsStore.deleteLesson(form.id)
    open.value = false
  } catch (error: any) {
    console.error("DELETE LESSON ERROR", error)
    errorMessage.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Ошибка при удалении"
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Редактировать занятие"
    description="Изменение существующего занятия"
    :ui="{ content: 'bg-transparent shadow-none ring-0 overflow-visible' }"
  >
    <template #content>
      <div class="panel p-6 rounded-2xl overflow-hidden">
        <div class="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-semibold mb-1">Редактировать занятие</h2>
            <p class="muted text-sm">Изменения существующей записи</p>
          </div>

          <UButton variant="ghost" @click="open = false">
            Закрыть
          </UButton>
        </div>

        <div class="space-y-4">
          <div class="field-group">
            <label class="field-label">Название занятия</label>
            <input v-model="form.title" type="text" class="field-input">
          </div>

          <div class="field-group">
            <label class="field-label">Ученик или группа</label>
            <input v-model="form.targetName" type="text" class="field-input">
          </div>

          <div class="field-group">
            <label class="field-label">Дата</label>
            <input v-model="form.lessonDate" type="date" class="field-input">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field-group">
              <label class="field-label">Начало</label>
              <input v-model="form.startTime" type="time" class="field-input" min="08:00" max="22:00">
            </div>

            <div class="field-group">
              <label class="field-label">Конец</label>
              <input v-model="form.endTime" type="time" class="field-input" min="08:00" max="22:00">
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
            <input v-model="form.linkUrl" type="text" class="field-input" placeholder="https://...">
          </div>

          <p v-if="errorMessage" class="text-sm text-red-400">
            {{ errorMessage }}
          </p>

          <div class="flex justify-between gap-3 pt-3">
            <UButton
              color="error"
              variant="outline"
              :loading="deleting"
              @click="removeLesson"
            >
              Удалить
            </UButton>

            <div class="flex gap-3">
              <UButton variant="outline" @click="open = false">
                Отмена
              </UButton>
              <UButton :loading="loading" @click="submit">
                Сохранить
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
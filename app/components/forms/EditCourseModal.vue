<script setup lang="ts">
const props = defineProps<{
  course: {
    id: number
    title: string
    targetName?: string | null
  } | null
}>()

const open = defineModel<boolean>("open", { default: false })

const coursesStore = useCoursesStore()

const form = reactive({
  id: 0,
  title: "",
  targetName: ""
})

const loading = ref(false)
const errorMessage = ref("")

watch(
  () => props.course,
  (course) => {
    if (!course) return

    form.id = course.id
    form.title = course.title || ""
    form.targetName = course.targetName || ""
    errorMessage.value = ""
  },
  { immediate: true }
)

async function submit() {
  errorMessage.value = ""
  loading.value = true

  try {
    if (!form.title.trim()) {
      errorMessage.value = "Введите название курса"
      loading.value = false
      return
    }

    await coursesStore.updateCourse({
      id: form.id,
      title: form.title,
      targetName: form.targetName
    })

    open.value = false
  } catch (error: any) {
    console.error("UPDATE COURSE ERROR", error)

    errorMessage.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Ошибка при сохранении курса"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Редактировать курс"
    description="Изменение названия курса и ученика"
    :ui="{
      content: 'bg-transparent shadow-none ring-0 overflow-visible'
    }"
  >
    <template #content>
      <div class="panel p-6 rounded-2xl overflow-hidden">
        <div class="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-semibold mb-1">Редактировать курс</h2>
            <p class="muted text-sm">
              Измени основные данные курса
            </p>
          </div>

          <UButton variant="ghost" @click="open = false">
            Закрыть
          </UButton>
        </div>

        <div class="space-y-4">
          <div class="field-group">
            <label class="field-label">Название курса</label>
            <input
              v-model="form.title"
              type="text"
              class="field-input"
            >
          </div>

          <div class="field-group">
            <label class="field-label">Ученик / группа</label>
            <input
              v-model="form.targetName"
              type="text"
              class="field-input"
            >
          </div>

          <p v-if="errorMessage" class="text-sm text-red-400">
            {{ errorMessage }}
          </p>

          <div class="flex justify-end gap-3 pt-3">
            <UButton variant="outline" @click="open = false">
              Отмена
            </UButton>

            <UButton :loading="loading" @click="submit">
              Сохранить
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
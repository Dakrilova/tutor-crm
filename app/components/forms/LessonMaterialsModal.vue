<script setup lang="ts">
type LessonMaterial = {
  id: number
  lessonId: number
  title: string
  url: string
  type: string
  description?: string | null
}

type LessonForMaterials = {
  id: number
  title: string
  materials?: LessonMaterial[]
}

const props = defineProps<{
  lesson: LessonForMaterials | null
}>()

const open = defineModel<boolean>("open", { default: false })

const lessonsStore = useLessonsStore()

const materialsLoading = ref(false)
const materialSaving = ref(false)
const materialDeletingId = ref<number | null>(null)
const materialError = ref("")

const materialForm = reactive({
  title: "",
  url: "",
  type: "PDF",
  description: ""
})

const materialTypes = ["PDF", "Презентация", "Видео", "Документ", "Другое"]

const lessonMaterials = computed(() => {
  return props.lesson?.materials || []
})

function resetMaterialForm() {
  materialForm.title = ""
  materialForm.url = ""
  materialForm.type = "PDF"
  materialForm.description = ""
}

watch(
  () => open.value,
  async (value) => {
    if (!value) {
      materialError.value = ""
      resetMaterialForm()
      return
    }

    if (!props.lesson) return

    materialError.value = ""

    if (!props.lesson.materials) {
      materialsLoading.value = true

      try {
        await lessonsStore.fetchLessonMaterials(props.lesson.id)
      } catch (error: any) {
        console.error("FETCH MATERIALS ERROR", error)
        materialError.value =
          error?.data?.statusMessage ||
          error?.statusMessage ||
          error?.message ||
          "Ошибка при загрузке материалов"
      } finally {
        materialsLoading.value = false
      }
    }
  }
)

async function addMaterial() {
  if (!props.lesson) return

  materialError.value = ""

  if (!materialForm.title.trim()) {
    materialError.value = "Введите название материала"
    return
  }

  if (!materialForm.url.trim()) {
    materialError.value = "Введите ссылку на материал"
    return
  }

  materialSaving.value = true

  try {
    await lessonsStore.createLessonMaterial({
      lessonId: props.lesson.id,
      title: materialForm.title,
      url: materialForm.url,
      type: materialForm.type,
      description: materialForm.description
    })

    resetMaterialForm()
  } catch (error: any) {
    console.error("CREATE MATERIAL ERROR", error)
    materialError.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Ошибка при добавлении материала"
  } finally {
    materialSaving.value = false
  }
}

async function removeMaterial(materialId: number) {
  if (!props.lesson) return

  const confirmed = window.confirm("Удалить материал?")

  if (!confirmed) return

  materialError.value = ""
  materialDeletingId.value = materialId

  try {
    await lessonsStore.deleteLessonMaterial({
      lessonId: props.lesson.id,
      materialId
    })
  } catch (error: any) {
    console.error("DELETE MATERIAL ERROR", error)
    materialError.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Ошибка при удалении материала"
  } finally {
    materialDeletingId.value = null
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Материалы урока"
    description="Ссылки на конспекты, презентации, видео и другие материалы"
    :ui="{ content: 'bg-transparent shadow-none ring-0 overflow-visible' }"
  >
    <template #content>
      <div class="panel p-6 rounded-2xl overflow-hidden lesson-materials-modal">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-semibold mb-1">
              Материалы урока
            </h2>

            <p class="muted text-sm">
              {{ lesson?.title || "Занятие" }}
            </p>
          </div>

          <button class="btn-secondary" type="button" @click="open = false">
            Закрыть
          </button>
        </div>

        <div v-if="materialsLoading" class="muted text-sm">
          Загрузка материалов...
        </div>

        <div v-else class="space-y-5">
          <div class="lesson-materials-modal-form">
            <div class="field-group">
              <label class="field-label">Название</label>
              <input
                v-model="materialForm.title"
                type="text"
                class="field-input"
                placeholder="Конспект по теме"
              >
            </div>

            <div class="field-group">
              <label class="field-label">Ссылка</label>
              <input
                v-model="materialForm.url"
                type="url"
                class="field-input"
                placeholder="https://drive.google.com/..."
              >
            </div>

            <div class="field-group">
              <label class="field-label">Тип</label>
              <select v-model="materialForm.type" class="field-select">
                <option
                  v-for="type in materialTypes"
                  :key="type"
                  :value="type"
                >
                  {{ type }}
                </option>
              </select>
            </div>

            <div class="field-group">
              <label class="field-label">Описание</label>
              <textarea
                v-model="materialForm.description"
                class="field-input lesson-materials-modal-textarea"
                placeholder="Теория и примеры к уроку"
              />
            </div>

            <button
              class="btn-primary w-full"
              type="button"
              :disabled="materialSaving"
              @click="addMaterial"
            >
              {{ materialSaving ? "Добавляем..." : "Добавить материал" }}
            </button>
          </div>

          <p v-if="materialError" class="text-sm text-red-400">
            {{ materialError }}
          </p>

          <div class="lesson-materials-modal-list">
            <div class="flex items-center justify-between gap-3 mb-3">
              <h3 class="text-lg font-semibold">
                Добавленные материалы
              </h3>

              <span class="muted text-sm">
                {{ lessonMaterials.length }}
              </span>
            </div>

            <div
              v-if="lessonMaterials.length"
              class="space-y-3"
            >
              <div
                v-for="material in lessonMaterials"
                :key="material.id"
                class="lesson-materials-modal-item"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <strong class="text-safe-wrap">
                      {{ material.title }}
                    </strong>

                    <span class="lesson-materials-modal-type">
                      {{ material.type }}
                    </span>
                  </div>

                  <p
                    v-if="material.description"
                    class="muted text-sm text-safe-wrap"
                  >
                    {{ material.description }}
                  </p>

                  <a
                    :href="material.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="lesson-materials-modal-url text-safe-wrap"
                  >
                    {{ material.url }}
                  </a>
                </div>

                <div class="lesson-materials-modal-actions">
                  <a
                    :href="material.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-secondary"
                  >
                    Открыть
                  </a>

                  <button
                    class="btn-danger"
                    type="button"
                    :disabled="materialDeletingId === material.id"
                    @click="removeMaterial(material.id)"
                  >
                    {{ materialDeletingId === material.id ? "Удаляем..." : "Удалить" }}
                  </button>
                </div>
              </div>
            </div>

            <div
              v-else
              class="lesson-materials-modal-empty"
            >
              Материалы пока не добавлены.
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
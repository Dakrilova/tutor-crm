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
      <div class="panel lesson-materials-modal">
        <div class="lesson-materials-modal-header">
          <div class="min-w-0">
            <h2>
              Материалы урока
            </h2>

            <p>
              {{ lesson?.title || "Занятие" }}
            </p>
          </div>

          <button
            class="modal-close-button"
            type="button"
            aria-label="Закрыть"
            @click="open = false"
          >
            ✕
          </button>
        </div>

        <div v-if="materialsLoading" class="lesson-materials-modal-loading">
          Загрузка материалов...
        </div>

        <div v-else class="lesson-materials-modal-content">
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
              class="btn-primary lesson-materials-modal-submit"
              type="button"
              :disabled="materialSaving"
              @click="addMaterial"
            >
              {{ materialSaving ? "Добавляем..." : "Добавить материал" }}
            </button>
          </div>

          <p v-if="materialError" class="lesson-materials-modal-error">
            {{ materialError }}
          </p>

          <div class="lesson-materials-modal-list">
            <div class="lesson-materials-modal-list-head">
              <h3>
                Добавленные материалы
              </h3>

              <span>
                {{ lessonMaterials.length }}
              </span>
            </div>

            <div
              v-if="lessonMaterials.length"
              class="lesson-materials-modal-items"
            >
              <div
                v-for="material in lessonMaterials"
                :key="material.id"
                class="lesson-materials-modal-item"
              >
                <div class="min-w-0">
                  <div class="lesson-materials-modal-item-head">
                    <strong class="text-safe-wrap">
                      {{ material.title }}
                    </strong>

                    <span class="lesson-materials-modal-type">
                      {{ material.type }}
                    </span>
                  </div>

                  <p
                    v-if="material.description"
                    class="lesson-materials-modal-description text-safe-wrap"
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

<style scoped>
.lesson-materials-modal {
  width: min(680px, calc(100vw - 48px));
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  padding: 24px !important;
  border-radius: 22px;
  background: #0f1115;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
  overflow-y: auto;
  overflow-x: hidden;
}

.lesson-materials-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.lesson-materials-modal-header h2 {
  margin: 0 0 4px;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.lesson-materials-modal-header p {
  margin: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

.lesson-materials-modal-loading {
  color: var(--muted);
  font-size: 14px;
}

.lesson-materials-modal-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lesson-materials-modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.lesson-materials-modal-form .field-group {
  gap: 0;
}

.lesson-materials-modal-textarea {
  min-height: 90px;
  resize: vertical;
  display: block;
}

.lesson-materials-modal-submit {
  width: 100%;
  margin-top: 4px;
}

.lesson-materials-modal-error {
  margin: 0;
  color: #f87171;
  font-size: 14px;
  line-height: 1.5;
}

.lesson-materials-modal-list {
  padding-top: 14px;
}

.lesson-materials-modal-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.lesson-materials-modal-list-head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.lesson-materials-modal-list-head span {
  color: var(--muted);
  font-size: 14px;
}

.lesson-materials-modal-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-materials-modal-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.7);
}

.lesson-materials-modal-item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin-bottom: 8px;
}

.lesson-materials-modal-type {
  width: fit-content;
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(0, 220, 130, 0.1);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.lesson-materials-modal-description {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

.lesson-materials-modal-url {
  display: block;
  max-width: 100%;
  margin-top: 8px;
  color: var(--accent);
  font-size: 13px;
  text-decoration: none;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.lesson-materials-modal-url:hover {
  text-decoration: underline;
}

.lesson-materials-modal-actions {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-shrink: 0;
}

.lesson-materials-modal-empty {
  padding: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.25);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.45);
  color: #b9c7e6;
  font-size: 14px;
}

.modal-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
} 

@media (max-width: 768px) {
  .lesson-materials-modal {
    width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px) !important;
    max-height: calc(100vh - 24px);
    padding: 20px !important;
  }

  .lesson-materials-modal-header h2 {
    font-size: 24px;
  }
}

@media (max-width: 640px) {
  .lesson-materials-modal-item {
    grid-template-columns: 1fr;
  }

  .lesson-materials-modal-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .lesson-materials-modal {
    width: calc(100vw - 16px) !important;
    max-width: calc(100vw - 16px) !important;
    padding: 18px !important;
  }

  .lesson-materials-modal-header h2 {
    font-size: 22px;
  }
}
</style>
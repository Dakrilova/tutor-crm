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
    :ui="{ content: 'bg-transparent shadow-none ring-0 overflow-visible' }"
  >
    <template #content>
      <div class="panel edit-course-modal">
        <div class="edit-course-modal-header">
          <div class="edit-course-modal-heading">
            <div class="edit-course-modal-badge">
              <span class="edit-course-modal-badge-dot" />
              Курс
            </div>

            <h2>Редактировать курс</h2>
            <p>Измени название курса и ученика или группу</p>
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

        <div class="edit-course-modal-form">
          <div class="field-group">
            <label class="field-label">Название курса</label>
            <input
              v-model="form.title"
              type="text"
              class="field-input"
              placeholder="Например, Английский B1"
            >
          </div>

          <div class="field-group">
            <label class="field-label">Ученик / группа</label>
            <input
              v-model="form.targetName"
              type="text"
              class="field-input"
              placeholder="Имя ученика или название группы"
            >
          </div>

          <p v-if="errorMessage" class="edit-course-modal-error">
            {{ errorMessage }}
          </p>

          <div class="edit-course-modal-actions">
            <button
              class="btn-secondary"
              type="button"
              @click="open = false"
            >
              Отмена
            </button>

            <button
              class="btn-primary"
              type="button"
              :disabled="loading"
              @click="submit"
            >
              {{ loading ? "Сохраняем..." : "Сохранить" }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.edit-course-modal {
  width: min(560px, calc(100vw - 48px));
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  padding: 24px;
  border-radius: 24px;
  overflow-y: auto;
  overflow-x: hidden;
}

.edit-course-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.edit-course-modal-heading {
  min-width: 0;
}

.edit-course-modal-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-bottom: 14px;
  padding: 8px 12px;
  border: 1px solid rgba(0, 220, 130, 0.16);
  border-radius: 999px;
  background: rgba(0, 220, 130, 0.08);
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
}

.edit-course-modal-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 14px rgba(0, 220, 130, 0.5);
}

.edit-course-modal h2 {
  margin: 0;
  font-size: 26px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.edit-course-modal p {
  margin: 8px 0 0;
}

.edit-course-modal-heading p {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

.edit-course-modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.edit-course-modal-error {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid rgba(255, 120, 120, 0.24);
  border-radius: 14px;
  background: rgba(255, 120, 120, 0.04);
  color: #ffb3b3;
  font-size: 14px;
  line-height: 1.5;
}

.edit-course-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}

.modal-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 640px) {
  .edit-course-modal {
    width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
    padding: 20px;
  }

  .edit-course-modal-header {
    gap: 12px;
  }

  .edit-course-modal h2 {
    font-size: 23px;
  }

  .edit-course-modal-actions {
    flex-direction: column-reverse;
  }

  .edit-course-modal-actions .btn-primary,
  .edit-course-modal-actions .btn-secondary {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .edit-course-modal {
    width: calc(100vw - 16px);
    max-width: calc(100vw - 16px);
    padding: 18px;
  }
}
</style>
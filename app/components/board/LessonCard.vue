<script setup lang="ts">
import LessonMaterialsModal from "@/components/forms/LessonMaterialsModal.vue"

const props = defineProps<{
  lesson: {
    id: number
    title: string
    targetName?: string | null
    status: "FREE" | "RESERVED" | "PAID" | "IN_PROGRESS" | "DONE"
    startAt: string
    endAt: string
    isPaid: boolean
    linkUrl?: string | null
    courseId?: number | null
    materials?: Array<{
      id: number
      lessonId: number
      title: string
      url: string
      type: string
      description?: string | null
    }>
    course?: {
      id: number
      title: string
      targetName?: string | null
    } | null
    student?: {
      id: number
      fullName: string
    } | null
    group?: {
      id: number
      title: string
    } | null
  }
}>()

const emit = defineEmits<{
  edit: [lesson: typeof props.lesson]
}>()

const materialsModalOpen = ref(false)

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

function getTargetLabel(lesson: any) {
  if (lesson.targetName) return lesson.targetName
  if (lesson.student?.fullName) return lesson.student.fullName
  if (lesson.group?.title) return lesson.group.title
  if (lesson.course?.targetName) return lesson.course.targetName
  return "Без ученика"
}

function onDragStart(event: DragEvent) {
  if (!event.dataTransfer) return

  event.dataTransfer.setData("text/plain", String(props.lesson.id))
  event.dataTransfer.effectAllowed = "move"
}

function handleClick() {
  emit("edit", props.lesson)
}

function openMaterialsModal() {
  materialsModalOpen.value = true
}
</script>

<template>
  <div
    class="lesson-card card-ui cursor-pointer min-w-0 flex flex-col"
    draggable="true"
    @click="handleClick"
    @dragstart="onDragStart"
  >
    <div class="lesson-card-head">
      <h3
        class="lesson-card-title text-safe-wrap"
        :title="lesson.title"
      >
        {{ lesson.title }}
      </h3>

      <span class="lesson-type-badge">
        {{ lesson.courseId ? "Курс" : "Одно" }}
      </span>
    </div>

    <p
      class="lesson-card-target muted text-safe-wrap"
      :title="getTargetLabel(lesson)"
    >
      {{ getTargetLabel(lesson) }}
    </p>

    <p
      v-if="lesson.course?.title"
      class="lesson-card-course muted text-safe-wrap"
      :title="lesson.course.title"
    >
      Курс: {{ lesson.course.title }}
    </p>

    <div class="lesson-card-time">
      <div class="text-safe-wrap">{{ formatDate(lesson.startAt) }}</div>
      <div class="muted text-safe-wrap">{{ formatDate(lesson.endAt) }}</div>
    </div>

    <div
      v-if="lesson.linkUrl"
      class="lesson-card-footer"
    >
      <a
        :href="lesson.linkUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="lesson-card-link"
        @click.stop
      >
        Ссылка на занятие
      </a>
    </div>

    <button
      type="button"
      class="lesson-card-materials-button"
      @click.stop="openMaterialsModal"
    >
      <span>Материалы урока</span>

      <span
        v-if="lesson.materials?.length"
        class="lesson-card-materials-count"
      >
        {{ lesson.materials.length }}
      </span>
    </button>

    <LessonMaterialsModal
      v-model:open="materialsModalOpen"
      :lesson="lesson"
    />
  </div>
</template>

<style scoped>
.lesson-card {
  display: flex;
  flex-direction: column;
  min-height: 220px;
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
  margin-bottom: 10px;
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

.lesson-card-target {
  min-height: 40px;
  margin: 0 0 10px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  font-size: 14px;
  line-height: 1.5;
}

.lesson-card-course {
  margin: 0 0 14px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  font-size: 12px;
  line-height: 1.5;
}

.lesson-card-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.lesson-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  margin-top: auto;
}

.lesson-card-link {
  flex-shrink: 0;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.lesson-card-link:hover {
  opacity: 0.8;
}

.lesson-card-materials-button {
  margin-top: 16px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(0, 220, 130, 0.45);
  border-radius: 12px;
  background: rgba(0, 220, 130, 0.08);
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.lesson-card-materials-button:hover {
  background: rgba(0, 220, 130, 0.12);
  border-color: var(--accent);
  transform: translateY(-1px);
}

.lesson-card-materials-count {
  min-width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 220, 130, 0.16);
  color: var(--accent);
  font-size: 12px;
}
</style>
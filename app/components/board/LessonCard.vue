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

    <div class="lesson-card-footer">
      <span class="lesson-card-payment text-safe-wrap">
        {{ lesson.isPaid ? "Оплачено" : "Не оплачено" }}
      </span>

      <a
        v-if="lesson.linkUrl"
        :href="lesson.linkUrl"
        target="_blank"
        class="lesson-card-link"
        @click.stop
      >
        Ссылка
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
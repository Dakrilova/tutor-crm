<script setup lang="ts">
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
</script>

<template>
  <div
    class="card-ui p-4 cursor-pointer hover:scale-[1.01] transition min-w-0 min-h-[220px] flex flex-col"
    draggable="true"
    @click="handleClick"
    @dragstart="onDragStart"
  >
    <div class="flex items-start justify-between gap-3 mb-2 min-w-0">
      <h3
        class="font-semibold leading-5 min-w-0 line-clamp-2 text-safe-wrap"
        :title="lesson.title"
      >
        {{ lesson.title }}
      </h3>

      <UBadge variant="soft" class="shrink-0">
        {{ lesson.courseId ? "Курс" : "Одно" }}
      </UBadge>
    </div>

    <p
      class="muted text-sm mb-2 min-w-0 line-clamp-2 text-safe-wrap min-h-[40px]"
      :title="getTargetLabel(lesson)"
    >
      {{ getTargetLabel(lesson) }}
    </p>

    <p
      v-if="lesson.course?.title"
      class="text-xs muted mb-3 min-w-0 line-clamp-1 text-safe-wrap"
      :title="lesson.course.title"
    >
      Курс: {{ lesson.course.title }}
    </p>

    <div class="space-y-1 text-sm mb-3 min-w-0">
      <div class="text-safe-wrap">{{ formatDate(lesson.startAt) }}</div>
      <div class="muted text-safe-wrap">{{ formatDate(lesson.endAt) }}</div>
    </div>

    <div class="mt-auto flex items-center justify-between gap-3 min-w-0">
      <span class="text-sm min-w-0 line-clamp-1 text-safe-wrap">
        {{ lesson.isPaid ? "Оплачено" : "Не оплачено" }}
      </span>

      <a
        v-if="lesson.linkUrl"
        :href="lesson.linkUrl"
        target="_blank"
        class="accent text-sm shrink-0"
        @click.stop
      >
        Ссылка
      </a>
    </div>
  </div>
</template>
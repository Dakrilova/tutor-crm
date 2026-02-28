<script setup lang="ts">
import LessonCard from "./LessonCard.vue"

const props = defineProps<{
  title: string
  status: "FREE" | "RESERVED" | "PAID" | "IN_PROGRESS" | "DONE"
  items: any[]
}>()

const emit = defineEmits<{
  edit: [lesson: any]
  dropLesson: [payload: { lessonId: number; status: typeof props.status }]
}>()

const isDragOver = ref(false)

function onDragOver(event: DragEvent) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move"
  }

  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false

  const lessonIdRaw = event.dataTransfer?.getData("text/plain")

  if (!lessonIdRaw) return

  const lessonId = Number(lessonIdRaw)

  if (!Number.isFinite(lessonId)) return

  emit("dropLesson", {
    lessonId,
    status: props.status
  })
}

function handleEdit(lesson: any) {
  emit("edit", lesson)
}
</script>

<template>
  <div
    class="panel p-4 min-h-[500px] transition"
    :class="{ 'ring-2 ring-white/20': isDragOver }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">{{ title }}</h2>
      <span class="muted text-sm">{{ items.length }}</span>
    </div>

    <div class="space-y-3">
      <LessonCard
        v-for="item in items"
        :key="item.id"
        :lesson="item"
        @edit="handleEdit"
      />

      <div
        v-if="items.length === 0"
        class="card-ui p-4 text-sm muted"
      >
        Занятий нет
      </div>
    </div>
  </div>
</template>
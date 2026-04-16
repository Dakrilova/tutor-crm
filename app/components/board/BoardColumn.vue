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
  <section
    class="board-column panel"
    :class="{ 'board-column--drag-over': isDragOver }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="board-column-header">
      <h2 class="board-column-title">{{ title }}</h2>
      <span class="board-column-count">{{ items.length }}</span>
    </header>

    <div class="board-column-body">
      <LessonCard
        v-for="item in items"
        :key="item.id"
        :lesson="item"
        @edit="handleEdit"
      />

      <div
        v-if="items.length === 0"
        class="board-column-empty card-ui"
      >
        Занятий нет
      </div>
    </div>
  </section>
</template>
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
const isCollapsed = ref(false)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

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
    :class="{
      'board-column--drag-over': isDragOver,
      'board-column--collapsed': isCollapsed
    }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="board-column-header">
      <div class="board-column-title-wrap">
        <h2 class="board-column-title">{{ title }}</h2>
        <span class="board-column-count">{{ items.length }}</span>
      </div>

      <button
        class="board-column-toggle"
        type="button"
        :aria-label="isCollapsed ? 'Развернуть столбец' : 'Свернуть столбец'"
        @click="toggleCollapse"
      >
        {{ isCollapsed ? "▼" : "▲" }}
      </button>
    </header>

    <div
      v-show="!isCollapsed"
      class="board-column-body"
    >
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

<style scoped>
.board-column {
  min-height: 500px;
  padding: 16px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.board-column--drag-over {
  border-color: rgba(0, 220, 130, 0.32);
  box-shadow: 0 0 0 2px rgba(0, 220, 130, 0.12);
  background: #12161d;
}

.board-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.board-column-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  width: 100%;
}

.board-column-title {
  margin: 0;
  min-width: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.board-column-count {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--muted);
}

.board-column-toggle {
  display: none !important;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(0, 220, 130, 0.45);
  border-radius: 10px;
  background: rgba(0, 220, 130, 0.08);
  color: var(--accent);
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.board-column-toggle:hover {
  background: rgba(0, 220, 130, 0.12);
  border-color: var(--accent);
}

.board-column-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.board-column-empty {
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
}

@media (max-width: 768px) {
  .board-column {
    min-height: auto;
  }

  .board-column-header {
    margin-bottom: 0;
  }

  .board-column-toggle {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
  }

  .board-column-body {
    margin-top: 14px;
  }

  .board-column--collapsed {
    min-height: auto;
  }
}
</style>
<script setup lang="ts">
type LessonStatus = "FREE" | "RESERVED" | "PAID" | "IN_PROGRESS" | "DONE"

type LessonItem = {
  id: number
  title: string
  targetName?: string | null
  status: LessonStatus
  startAt: string
  endAt: string
  linkUrl?: string | null
  materials?: Array<{
    id: number
    lessonId: number
    title: string
    url: string
    type: string
    description?: string | null
  }>
  courseId?: number | null
  course?: {
    id: number
    title: string
    targetName?: string | null
  } | null
}

const props = defineProps<{
  lessons: LessonItem[]
}>()

const open = defineModel<boolean>("open", { default: false })

const now = computed(() => new Date())

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getLessonEndDate(lesson: LessonItem) {
  return new Date(lesson.endAt)
}

function isPastLesson(lesson: LessonItem) {
  const endDate = getLessonEndDate(lesson)

  if (Number.isNaN(endDate.getTime())) {
    return false
  }

  return endDate < now.value
}

function formatDateTime(value: string) {
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

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  })
}

function getLessonSubtitle(lesson: LessonItem) {
  if (lesson.course?.title) return `Курс: ${lesson.course.title}`
  if (lesson.targetName) return lesson.targetName
  return lesson.courseId ? "Урок курса" : "Одиночное занятие"
}

function sortByStartAt(a: LessonItem, b: LessonItem) {
  return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
}

const todayKey = computed(() => {
  return toDateKey(now.value)
})

const tomorrowKey = computed(() => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 1)
  return toDateKey(date)
})

const activeLessons = computed(() => {
  return props.lessons
    .filter(lesson => !isPastLesson(lesson))
    .sort(sortByStartAt)
})

const pastLessons = computed(() => {
  return props.lessons
    .filter(isPastLesson)
    .sort(sortByStartAt)
})

const todayLessons = computed(() => {
  return activeLessons.value.filter((lesson) => {
    const date = new Date(lesson.startAt)

    if (Number.isNaN(date.getTime())) {
      return false
    }

    return toDateKey(date) === todayKey.value
  })
})

const tomorrowLessons = computed(() => {
  return activeLessons.value.filter((lesson) => {
    const date = new Date(lesson.startAt)

    if (Number.isNaN(date.getTime())) {
      return false
    }

    return toDateKey(date) === tomorrowKey.value
  })
})

const lessonsWithoutMaterials = computed(() => {
  return activeLessons.value.filter((lesson) => {
    return !lesson.materials || lesson.materials.length === 0
  })
})

const lessonsWithoutLinks = computed(() => {
  return activeLessons.value.filter((lesson) => {
    const statusesWithLink = ["RESERVED", "PAID", "IN_PROGRESS"]
    return statusesWithLink.includes(lesson.status) && !lesson.linkUrl
  })
})

const notificationsCount = computed(() => {
  let count = 0

  if (todayLessons.value.length) count++
  if (tomorrowLessons.value.length) count++
  if (lessonsWithoutMaterials.value.length) count++
  if (lessonsWithoutLinks.value.length) count++
  if (pastLessons.value.length) count++

  return count
})
</script>

<template>
  <UModal
    v-model:open="open"
    title="Уведомления"
    description="Подсказки по занятиям, материалам и расписанию"
    :ui="{ content: 'bg-transparent shadow-none ring-0 overflow-visible' }"
  >
    <template #content>
      <div class="panel notifications-modal">
        <div class="notifications-modal-header">
          <div class="min-w-0">
            <h2 class="notifications-modal-title">
              Уведомления
            </h2>

            <p class="notifications-modal-subtitle">
              {{ notificationsCount ? `${notificationsCount} активных уведомлений` : "Все спокойно" }}
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

        <div class="notifications-list">
          <section
            v-if="todayLessons.length"
            class="notification-card notification-card-accent"
          >
            <div class="notification-card-head">
              <h3>Сегодня есть занятия</h3>
              <span>{{ todayLessons.length }}</span>
            </div>

            <div class="notification-lessons">
              <div
                v-for="lesson in todayLessons"
                :key="lesson.id"
                class="notification-lesson"
              >
                <span>{{ formatTime(lesson.startAt) }}</span>

                <div class="min-w-0">
                  <strong>{{ lesson.title }}</strong>
                  <p>{{ getLessonSubtitle(lesson) }}</p>
                </div>
              </div>
            </div>
          </section>

          <section
            v-if="tomorrowLessons.length"
            class="notification-card"
          >
            <div class="notification-card-head">
              <h3>Завтра запланированы занятия</h3>
              <span>{{ tomorrowLessons.length }}</span>
            </div>

            <div class="notification-lessons">
              <div
                v-for="lesson in tomorrowLessons"
                :key="lesson.id"
                class="notification-lesson"
              >
                <span>{{ formatTime(lesson.startAt) }}</span>

                <div class="min-w-0">
                  <strong>{{ lesson.title }}</strong>
                  <p>{{ getLessonSubtitle(lesson) }}</p>
                </div>
              </div>
            </div>
          </section>

          <section
            v-if="lessonsWithoutMaterials.length"
            class="notification-card"
          >
            <div class="notification-card-head">
              <h3>Уроки без материалов</h3>
              <span>{{ lessonsWithoutMaterials.length }}</span>
            </div>

            <p class="notification-description">
              Добавь материалы, чтобы к занятию были конспекты, презентации или ссылки.
            </p>

            <div class="notification-lessons compact">
              <div
                v-for="lesson in lessonsWithoutMaterials.slice(0, 5)"
                :key="lesson.id"
                class="notification-lesson"
              >
                <span>{{ formatDateTime(lesson.startAt) }}</span>

                <div class="min-w-0">
                  <strong>{{ lesson.title }}</strong>
                  <p>{{ getLessonSubtitle(lesson) }}</p>
                </div>
              </div>
            </div>

            <p
              v-if="lessonsWithoutMaterials.length > 5"
              class="notification-more"
            >
              Еще {{ lessonsWithoutMaterials.length - 5 }} занятий без материалов.
            </p>
          </section>

          <section
            v-if="lessonsWithoutLinks.length"
            class="notification-card"
          >
            <div class="notification-card-head">
              <h3>Уроки без ссылки</h3>
              <span>{{ lessonsWithoutLinks.length }}</span>
            </div>

            <p class="notification-description">
              У забронированных, оплаченных или текущих занятий лучше указать ссылку на встречу.
            </p>

            <div class="notification-lessons compact">
              <div
                v-for="lesson in lessonsWithoutLinks.slice(0, 5)"
                :key="lesson.id"
                class="notification-lesson"
              >
                <span>{{ formatDateTime(lesson.startAt) }}</span>

                <div class="min-w-0">
                  <strong>{{ lesson.title }}</strong>
                  <p>{{ getLessonSubtitle(lesson) }}</p>
                </div>
              </div>
            </div>

            <p
              v-if="lessonsWithoutLinks.length > 5"
              class="notification-more"
            >
              Еще {{ lessonsWithoutLinks.length - 5 }} занятий без ссылки.
            </p>
          </section>

          <section
            v-if="pastLessons.length"
            class="notification-card notification-card-muted"
          >
            <div class="notification-card-head">
              <h3>Прошедшие занятия скрыты с доски</h3>
              <span>{{ pastLessons.length }}</span>
            </div>

            <p class="notification-description">
              Эти занятия уже завершились по времени, поэтому они больше не отображаются в колонках доски.
            </p>
          </section>

          <div
            v-if="!notificationsCount"
            class="notification-empty"
          >
            Уведомлений пока нет. Все занятия выглядят подготовленными.
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.notifications-modal {
  width: min(700px, calc(100vw - 48px));
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  padding: 24px !important;
  border-radius: 22px;
  background: #0f1115;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
  overflow-y: auto;
  overflow-x: hidden;
}

.notifications-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.notifications-modal-title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.notifications-modal-subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-card {
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  background: rgba(20, 24, 33, 0.96);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.14);
}

.notification-card-accent {
  border-color: rgba(0, 220, 130, 0.3);
  background: rgba(0, 220, 130, 0.06);
}

.notification-card-muted {
  background: rgba(148, 163, 184, 0.06);
}

.notification-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.notification-card-head h3 {
  margin: 0;
  min-width: 0;
  color: var(--text);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.3;
}

.notification-card-head span {
  flex-shrink: 0;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 220, 130, 0.12);
  color: var(--accent);
  font-size: 13px;
  font-weight: 800;
}

.notification-description {
  max-width: 560px;
  margin: 0 0 12px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

.notification-lessons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-lessons.compact {
  gap: 8px;
}

.notification-lesson {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
  padding: 10px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.notification-lesson:first-child {
  border-top: 0;
  padding-top: 0;
}

.notification-lesson:last-child {
  padding-bottom: 0;
}

.notification-lesson > span {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.4;
  white-space: nowrap;
}

.notification-lesson strong {
  display: block;
  color: var(--text);
  font-size: 14px;
  line-height: 1.35;
}

.notification-lesson p {
  margin: 3px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.4;
}

.notification-more {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.notification-empty {
  padding: 20px;
  border: 1px dashed rgba(148, 163, 184, 0.25);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.45);
  color: var(--muted);
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
  .notifications-modal {
    width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px) !important;
    max-height: calc(100vh - 24px);
    padding: 20px !important;
  }

  .notifications-modal-title {
    font-size: 24px;
  }

  .notifications-modal-header {
    align-items: flex-start;
  }

  .notification-lesson {
    grid-template-columns: 1fr;
    gap: 5px;
  }
}

@media (max-width: 640px) {
  .notifications-modal-header {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .notifications-modal {
    width: calc(100vw - 16px) !important;
    max-width: calc(100vw - 16px) !important;
    padding: 18px !important;
  }

  .notifications-modal-title {
    font-size: 22px;
  }

  .notification-card-head {
    gap: 10px;
  }
}
</style>
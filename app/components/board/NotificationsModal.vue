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
      <div class="panel p-6 rounded-2xl notifications-modal">
        <div class="notifications-modal-header">
          <div class="min-w-0">
            <h2 class="text-2xl font-semibold mb-1">
              Уведомления
            </h2>

            <p class="muted text-sm">
              {{ notificationsCount ? `${notificationsCount} активных уведомлений` : "Все спокойно" }}
            </p>
          </div>

          <button class="btn-secondary" type="button" @click="open = false">
            Закрыть
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
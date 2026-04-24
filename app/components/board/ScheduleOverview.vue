<script setup lang="ts">
type LessonStatus = "FREE" | "RESERVED" | "PAID" | "IN_PROGRESS" | "DONE"

type LessonItem = {
  id: number
  title: string
  targetName?: string | null
  status: LessonStatus
  startAt: string
  endAt: string
  isPaid: boolean
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

const today = new Date()
today.setHours(0, 0, 0, 0)

const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

const weekEnd = new Date(today)
weekEnd.setDate(today.getDate() + 7)

const currentYear = today.getFullYear()
const currentMonth = today.getMonth()

const monthName = computed(() => {
  return today.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric"
  })
})

function getLessonDate(lesson: LessonItem) {
  const date = new Date(lesson.startAt)
  date.setHours(0, 0, 0, 0)
  return date
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
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

function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long"
  })
}

function getLessonSubtitle(lesson: LessonItem) {
  if (lesson.course?.title) return lesson.course.title
  if (lesson.targetName) return lesson.targetName
  return lesson.courseId ? "Урок курса" : "Одиночное занятие"
}

function sortByStartAt(a: LessonItem, b: LessonItem) {
  return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
}

const todayLessons = computed(() => {
  const todayKey = toDateKey(today)

  return props.lessons
    .filter(lesson => toDateKey(getLessonDate(lesson)) === todayKey)
    .sort(sortByStartAt)
})

const tomorrowLessons = computed(() => {
  const tomorrowKey = toDateKey(tomorrow)

  return props.lessons
    .filter(lesson => toDateKey(getLessonDate(lesson)) === tomorrowKey)
    .sort(sortByStartAt)
})

const weekLessons = computed(() => {
  return props.lessons
    .filter((lesson) => {
      const lessonDate = getLessonDate(lesson)
      return lessonDate >= today && lessonDate <= weekEnd
    })
    .sort(sortByStartAt)
})

const weekLessonsByDate = computed(() => {
  const groups: Record<string, LessonItem[]> = {}

  for (const lesson of weekLessons.value) {
    const key = toDateKey(getLessonDate(lesson))

    if (!groups[key]) {
      groups[key] = []
    }

    groups[key].push(lesson)
  }

  return Object.entries(groups).map(([dateKey, lessons]) => ({
    dateKey,
    date: new Date(dateKey),
    lessons
  }))
})

function getLessonsByDateKey(dateKey: string) {
  return props.lessons
    .filter(lesson => toDateKey(getLessonDate(lesson)) === dateKey)
    .sort(sortByStartAt)
}

const calendarDays = computed(() => {
  const days: Array<{
    type: "empty" | "day"
    day?: number
    dateKey?: string
    lessons?: LessonItem[]
    isToday?: boolean
  }> = []

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)

  let firstWeekDay = firstDayOfMonth.getDay()

  if (firstWeekDay === 0) {
    firstWeekDay = 7
  }

  for (let i = 1; i < firstWeekDay; i++) {
    days.push({
      type: "empty"
    })
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dateKey = toDateKey(date)

    days.push({
      type: "day",
      day,
      dateKey,
      lessons: getLessonsByDateKey(dateKey),
      isToday: dateKey === toDateKey(today)
    })
  }

  return days
})
</script>

<template>
  <UModal
    v-model:open="open"
    title="Расписание"
    description="Ближайшие занятия и мини-календарь"
    :ui="{ content: 'bg-transparent shadow-none ring-0 overflow-visible' }"
  >
    <template #content>
      <div class="panel p-6 rounded-2xl overflow-hidden schedule-modal">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-semibold mb-1">Расписание</h2>
            <p class="muted text-sm">
              Ближайшие занятия и мини-календарь
            </p>
          </div>

          <button class="btn-secondary" type="button" @click="open = false">
            Закрыть
          </button>
        </div>

        <section class="schedule-overview schedule-overview-modal">
          <div class="schedule-agenda panel">
            <div class="schedule-section">
              <div class="schedule-section-head">
                <h2>Ближайшие занятия</h2>
                <span>{{ weekLessons.length }} на 7 дней</span>
              </div>

              <div class="schedule-quick-grid">
                <div class="schedule-quick-card">
                  <div class="schedule-quick-title">Сегодня</div>

                  <div v-if="todayLessons.length" class="schedule-lessons-list">
                    <div
                      v-for="lesson in todayLessons"
                      :key="lesson.id"
                      class="schedule-lesson-item"
                    >
                      <span>{{ formatTime(lesson.startAt) }}</span>
                      <div>
                        <strong>{{ lesson.title }}</strong>
                        <p>{{ getLessonSubtitle(lesson) }}</p>
                      </div>
                    </div>
                  </div>

                  <p v-else class="schedule-empty-text">
                    На сегодня занятий нет.
                  </p>
                </div>

                <div class="schedule-quick-card">
                  <div class="schedule-quick-title">Завтра</div>

                  <div v-if="tomorrowLessons.length" class="schedule-lessons-list">
                    <div
                      v-for="lesson in tomorrowLessons"
                      :key="lesson.id"
                      class="schedule-lesson-item"
                    >
                      <span>{{ formatTime(lesson.startAt) }}</span>
                      <div>
                        <strong>{{ lesson.title }}</strong>
                        <p>{{ getLessonSubtitle(lesson) }}</p>
                      </div>
                    </div>
                  </div>

                  <p v-else class="schedule-empty-text">
                    На завтра занятий нет.
                  </p>
                </div>
              </div>

              <div class="schedule-week">
                <h3>На этой неделе</h3>

                <div v-if="weekLessonsByDate.length" class="schedule-week-list">
                  <div
                    v-for="group in weekLessonsByDate"
                    :key="group.dateKey"
                    class="schedule-week-group"
                  >
                    <div class="schedule-week-date">
                      {{ formatDate(group.date) }}
                    </div>

                    <div class="schedule-week-items">
                      <div
                        v-for="lesson in group.lessons"
                        :key="lesson.id"
                        class="schedule-week-item"
                      >
                        <span>{{ formatTime(lesson.startAt) }}</span>
                        <strong>{{ lesson.title }}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <p v-else class="schedule-empty-text">
                  На этой неделе занятий нет.
                </p>
              </div>
            </div>
          </div>

          <aside class="mini-calendar panel">
            <div class="mini-calendar-head">
              <h2>{{ monthName }}</h2>
              <span>Мини-календарь</span>
            </div>

            <div class="mini-calendar-weekdays">
              <span>Пн</span>
              <span>Вт</span>
              <span>Ср</span>
              <span>Чт</span>
              <span>Пт</span>
              <span>Сб</span>
              <span>Вс</span>
            </div>

            <div class="mini-calendar-grid">
              <div
                v-for="(item, index) in calendarDays"
                :key="index"
                class="mini-calendar-cell"
                :class="{
                  'mini-calendar-cell-empty': item.type === 'empty',
                  'mini-calendar-cell-active': item.lessons && item.lessons.length,
                  'mini-calendar-cell-today': item.isToday
                }"
              >
                <template v-if="item.type === 'day'">
                  <span class="mini-calendar-day">
                    {{ item.day }}
                  </span>

                  <span
                    v-if="item.lessons && item.lessons.length"
                    class="mini-calendar-dot"
                  />

                  <div
                    v-if="item.lessons && item.lessons.length"
                    class="mini-calendar-tooltip"
                  >
                    <strong>{{ formatDate(item.dateKey || "") }}</strong>

                    <div
                      v-for="lesson in item.lessons"
                      :key="lesson.id"
                      class="mini-calendar-tooltip-item"
                    >
                      — {{ lesson.title }}, {{ formatTime(lesson.startAt) }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </template>
  </UModal>
</template>
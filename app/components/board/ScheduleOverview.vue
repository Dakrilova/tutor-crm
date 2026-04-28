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
      <div class="panel schedule-modal">
        <div class="schedule-modal-header">
          <div>
            <h2>Расписание</h2>
            <p>
              Ближайшие занятия и мини-календарь
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

<style scoped>
.schedule-modal {
  width: min(1040px, calc(100vw - 48px));
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  padding: 24px !important;
  border-radius: 22px;
  background: #0f1115;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
  overflow-y: auto;
  overflow-x: hidden;
}

.schedule-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.schedule-modal-header h2 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.schedule-modal-header p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

.schedule-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 420px);
  gap: 20px;
  align-items: stretch;
}

.schedule-overview-modal {
  margin-bottom: 0;
}

.schedule-agenda,
.mini-calendar {
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.42);
}

.schedule-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.schedule-section-head,
.mini-calendar-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.schedule-section-head h2,
.mini-calendar-head h2 {
  margin: 0;
  font-size: 21px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-transform: capitalize;
}

.schedule-section-head span,
.mini-calendar-head span {
  padding-top: 3px;
  color: var(--muted);
  font-size: 13px;
  white-space: nowrap;
}

.schedule-quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.schedule-quick-card {
  min-height: 134px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: rgba(23, 26, 32, 0.72);
}

.schedule-quick-title {
  margin-bottom: 12px;
  color: var(--accent);
  font-size: 14px;
  font-weight: 800;
}

.schedule-lessons-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-lesson-item {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
}

.schedule-lesson-item span {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.4;
}

.schedule-lesson-item strong {
  display: block;
  color: var(--text);
  font-size: 14px;
  line-height: 1.35;
}

.schedule-lesson-item p {
  margin: 3px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.4;
}

.schedule-empty-text {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

.schedule-week {
  padding-top: 2px;
}

.schedule-week h3 {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 800;
}

.schedule-week-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-week-group {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: start;
  gap: 14px;
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.38);
}

.schedule-week-date {
  color: var(--accent);
  font-size: 13px;
  font-weight: 800;
  text-transform: capitalize;
}

.schedule-week-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-week-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  font-size: 14px;
}

.schedule-week-item span {
  flex-shrink: 0;
  min-width: 46px;
  color: var(--muted);
}

.mini-calendar {
  position: relative;
  width: 100%;
  min-width: 380px;
  max-width: none;
}

.mini-calendar-head {
  align-items: flex-start;
}

.mini-calendar-head h2 {
  max-width: none;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  font-size: 22px;
}

.mini-calendar-weekdays,
.mini-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(38px, 1fr));
  gap: 9px;
}

.mini-calendar-weekdays {
  margin-top: 18px;
  margin-bottom: 8px;
}

.mini-calendar-weekdays span {
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.mini-calendar-cell {
  position: relative;
  min-height: 42px;
  aspect-ratio: 1 / 1;
  border: 1px solid transparent;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 14px;
}

.mini-calendar-cell-empty {
  visibility: hidden;
}

.mini-calendar-cell-active {
  border-color: rgba(0, 220, 130, 0.25);
  background: rgba(0, 220, 130, 0.09);
  color: var(--text);
  cursor: pointer;
}

.mini-calendar-cell-today {
  border-color: rgba(0, 220, 130, 0.55);
  color: var(--accent);
  font-weight: 800;
}

.mini-calendar-day {
  position: relative;
  z-index: 1;
}

.mini-calendar-dot {
  position: absolute;
  bottom: 6px;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 10px rgba(0, 220, 130, 0.45);
}

.mini-calendar-tooltip {
  display: none;
  position: absolute;
  left: 50%;
  bottom: 46px;
  transform: translateX(-50%);
  z-index: 30;
  min-width: 230px;
  max-width: 280px;
  padding: 12px;
  border: 1px solid rgba(0, 220, 130, 0.22);
  border-radius: 14px;
  background: #11151d;
  color: var(--text);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

.mini-calendar-cell-active:hover .mini-calendar-tooltip {
  display: block;
}

.mini-calendar-tooltip strong {
  display: block;
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 13px;
  text-transform: capitalize;
}

.mini-calendar-tooltip-item {
  color: #d9e5ff;
  font-size: 13px;
  line-height: 1.45;
}

.modal-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1180px) {
  .schedule-modal {
    width: min(820px, calc(100vw - 40px));
  }

  .schedule-overview {
    grid-template-columns: 1fr;
  }

  .mini-calendar {
    min-width: 0;
  }

  .mini-calendar-weekdays,
  .mini-calendar-grid {
    grid-template-columns: repeat(7, minmax(34px, 1fr));
  }

  .mini-calendar-cell {
    min-height: 40px;
  }
}

@media (max-width: 768px) {
  .schedule-modal {
    width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px) !important;
    max-height: calc(100vh - 24px);
    padding: 20px !important;
  }

  .schedule-modal-header h2 {
    font-size: 24px;
  }

  .schedule-quick-grid {
    grid-template-columns: 1fr;
  }

  .schedule-week-group {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .mini-calendar {
    min-width: 0;
  }

  .mini-calendar-head {
    flex-direction: column;
    gap: 4px;
  }

  .mini-calendar-weekdays,
  .mini-calendar-grid {
    gap: 7px;
    grid-template-columns: repeat(7, minmax(30px, 1fr));
  }

  .mini-calendar-cell {
    min-height: 36px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .schedule-modal {
    width: calc(100vw - 16px) !important;
    max-width: calc(100vw - 16px) !important;
    padding: 18px !important;
  }

  .schedule-modal-header h2 {
    font-size: 22px;
  }

  .schedule-section-head,
  .mini-calendar-head {
    gap: 10px;
  }

  .schedule-section-head h2,
  .mini-calendar-head h2 {
    font-size: 19px;
  }

  .mini-calendar-weekdays,
  .mini-calendar-grid {
    gap: 5px;
    grid-template-columns: repeat(7, minmax(28px, 1fr));
  }

  .mini-calendar-cell {
    min-height: 32px;
    border-radius: 9px;
  }
}
</style>
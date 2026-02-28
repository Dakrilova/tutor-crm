type LessonStatus =
  | "FREE"
  | "RESERVED"
  | "PAID"
  | "IN_PROGRESS"
  | "DONE"

type LessonItem = {
  id: number
  title: string
  targetName?: string | null
  status: LessonStatus
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

type LessonKindFilter = "all" | "single" | "course"

export const useLessonsStore = defineStore("lessons", () => {
  const items = ref<LessonItem[]>([])
  const loading = ref(false)

  async function fetchLessons() {
    loading.value = true

    try {
      let response: {
        ok: boolean
        lessons: LessonItem[]
      }

      if (process.server) {
        response = await useRequestFetch()<{
          ok: boolean
          lessons: LessonItem[]
        }>("/api/lessons")
      } else {
        response = await $fetch<{
          ok: boolean
          lessons: LessonItem[]
        }>("/api/lessons")
      }

      items.value = response.lessons || []
    } catch (error) {
      console.error("FETCH LESSONS ERROR", error)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  function sortItems() {
    items.value.sort((a, b) => {
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    })
  }

  function addOne(lesson: LessonItem) {
    items.value.push(lesson)
    sortItems()
  }

  function replaceOne(updatedLesson: LessonItem) {
    const index = items.value.findIndex(item => item.id === updatedLesson.id)

    if (index === -1) {
      items.value.push(updatedLesson)
    } else {
      items.value[index] = updatedLesson
    }

    sortItems()
  }

  function removeOne(id: number) {
    items.value = items.value.filter(item => item.id !== id)
  }

  function getFilteredItems(filters: {
    date?: string
    search?: string
    kind?: LessonKindFilter
  }) {
    const searchValue = (filters.search || "").trim().toLowerCase()
    const dateValue = (filters.date || "").trim()
    const kindValue = filters.kind || "all"

    return items.value.filter((item) => {
      if (dateValue) {
        const itemDate = new Date(item.startAt)

        if (Number.isNaN(itemDate.getTime())) {
          return false
        }

        const year = itemDate.getFullYear()
        const month = String(itemDate.getMonth() + 1).padStart(2, "0")
        const day = String(itemDate.getDate()).padStart(2, "0")
        const normalizedDate = `${year}-${month}-${day}`

        if (normalizedDate !== dateValue) {
          return false
        }
      }

      if (kindValue === "single" && item.courseId) {
        return false
      }

      if (kindValue === "course" && !item.courseId) {
        return false
      }

      if (searchValue) {
        const haystack = [
          item.title,
          item.targetName,
          item.course?.title,
          item.course?.targetName,
          item.student?.fullName,
          item.group?.title
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(searchValue)) {
          return false
        }
      }

      return true
    })
  }

  function getByStatus(
    status: LessonStatus,
    filters?: {
      date?: string
      search?: string
      kind?: LessonKindFilter
    }
  ) {
    const base = filters ? getFilteredItems(filters) : items.value
    return base.filter(item => item.status === status)
  }

  async function createSingleLesson(payload: {
    title: string
    targetName?: string
    startAt: string
    endAt: string
    status: LessonStatus
    isPaid: boolean
    linkUrl?: string
  }) {
    const response = await $fetch<{
      ok: boolean
      lesson: LessonItem
    }>("/api/lessons/create-single", {
      method: "POST",
      body: payload
    })

    addOne(response.lesson)
    return response.lesson
  }

  async function createCourseLesson(payload: {
    courseId: number
    title: string
    startAt: string
    endAt: string
    status: LessonStatus
    isPaid: boolean
    linkUrl?: string
  }) {
    const response = await $fetch<{
      ok: boolean
      lesson: LessonItem
    }>("/api/courses/add-lesson", {
      method: "POST",
      body: payload
    })

    addOne(response.lesson)
    return response.lesson
  }

  async function updateLesson(payload: {
    id: number
    title: string
    targetName?: string
    startAt: string
    endAt: string
    status: LessonStatus
    isPaid: boolean
    linkUrl?: string
  }) {
    const response = await $fetch<{
      ok: boolean
      lesson: LessonItem
    }>("/api/lessons/update", {
      method: "PATCH",
      body: payload
    })

    replaceOne(response.lesson)
    return response.lesson
  }

  async function updateLessonStatus(id: number, status: LessonStatus) {
    const response = await $fetch<{
      ok: boolean
      lesson: LessonItem
    }>("/api/lessons/update-status", {
      method: "PATCH",
      body: {
        id,
        status
      }
    })

    replaceOne(response.lesson)
    return response.lesson
  }

  async function deleteLesson(id: number) {
    const response = await $fetch<{
      ok: boolean
      deletedId: number
    }>("/api/lessons/delete", {
      method: "DELETE",
      body: { id }
    })

    removeOne(response.deletedId)
    return response.deletedId
  }

  return {
    items,
    loading,
    fetchLessons,
    addOne,
    replaceOne,
    removeOne,
    getFilteredItems,
    getByStatus,
    createSingleLesson,
    createCourseLesson,
    updateLesson,
    updateLessonStatus,
    deleteLesson
  }
})
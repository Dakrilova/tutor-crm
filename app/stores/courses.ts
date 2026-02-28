type CourseItem = {
  id: number
  title: string
  targetName?: string | null
  lessons?: Array<{
    id: number
    title: string
    startAt: string
    endAt: string
    status: "FREE" | "RESERVED" | "PAID" | "IN_PROGRESS" | "DONE"
    isPaid: boolean
  }>
}

export const useCoursesStore = defineStore("courses", () => {
  const items = ref<CourseItem[]>([])
  const loading = ref(false)

  async function fetchCourses() {
    loading.value = true

    try {
      const headers = process.server
        ? useRequestHeaders(["cookie"])
        : undefined

      const response = await $fetch<{
        ok: boolean
        courses: CourseItem[]
      }>("/api/courses", {
        headers
      })

      items.value = response.courses || []
    } catch (error) {
      console.error("FETCH COURSES ERROR", error)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function createCourse(payload: {
    title: string
    targetName?: string
  }) {
    const response = await $fetch<{
      ok: boolean
      course: CourseItem
    }>("/api/courses/create", {
      method: "POST",
      body: payload
    })

    items.value.unshift(response.course)
    return response.course
  }

  function replaceOne(updatedCourse: CourseItem) {
    const index = items.value.findIndex(item => item.id === updatedCourse.id)

    if (index === -1) {
      items.value.unshift(updatedCourse)
    } else {
      items.value[index] = {
        ...items.value[index],
        ...updatedCourse
      }
    }
  }

  async function updateCourse(payload: {
    id: number
    title: string
    targetName?: string
  }) {
    const response = await $fetch<{
      ok: boolean
      course: CourseItem
    }>("/api/courses/update", {
      method: "PATCH",
      body: payload
    })

    replaceOne(response.course)
    return response.course
  }

  function removeOne(id: number) {
    items.value = items.value.filter(item => item.id !== id)
  }

  async function deleteCourse(id: number) {
    const response = await $fetch<{
      ok: boolean
      deletedId: number
    }>("/api/courses/delete", {
      method: "DELETE",
      body: { id }
    })

    removeOne(response.deletedId)
    return response.deletedId
  }

  return {
    items,
    loading,
    fetchCourses,
    createCourse,
    replaceOne,
    updateCourse,
    removeOne,
    deleteCourse
  }
})
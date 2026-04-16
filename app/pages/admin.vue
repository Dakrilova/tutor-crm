<script setup lang="ts">
definePageMeta({
  middleware: ["admin"]
})

type AdminStats = {
  teachersCount: number
  adminsCount: number
  coursesCount: number
  lessonsCount: number
  completedLessonsCount: number
  paidLessonsCount: number
}

const auth = useAuthStore()

const stats = ref<AdminStats>({
  teachersCount: 0,
  adminsCount: 0,
  coursesCount: 0,
  lessonsCount: 0,
  completedLessonsCount: 0,
  paidLessonsCount: 0
})

const loading = ref(true)
const errorMessage = ref("")

async function loadStats() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await $fetch<{
      ok: boolean
      stats: AdminStats
    }>("/api/admin/stats")

    if (response?.ok) {
      stats.value = response.stats
    } else {
      errorMessage.value = "Не удалось загрузить статистику"
    }
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage ||
      error?.message ||
      "Ошибка при загрузке статистики"
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchMe()
  }

  await loadStats()
})

const statCards = computed(() => [
  {
    title: "Преподаватели",
    value: stats.value.teachersCount,
    description: "Всего пользователей с ролью TEACHER"
  },
  {
    title: "Администраторы",
    value: stats.value.adminsCount,
    description: "Всего пользователей с ролью ADMIN"
  },
  {
    title: "Курсы",
    value: stats.value.coursesCount,
    description: "Создано курсов"
  },
  {
    title: "Все занятия",
    value: stats.value.lessonsCount,
    description: "Общее количество занятий"
  },
  {
    title: "Завершенные занятия",
    value: stats.value.completedLessonsCount,
    description: "Занятия со статусом DONE"
  },
  {
    title: "Оплаченные занятия",
    value: stats.value.paidLessonsCount,
    description: "Занятия с отметкой оплаты"
  }
])
</script>

<template>
  <div class="admin-page">
    <div class="app-header-shell">
      <div class="app-header">
        <div class="app-header-left">
          <p class="app-title">Админка</p>
          <p class="app-subtitle">
            Общая статистика системы и быстрый доступ к управлению
          </p>
        </div>

        <div class="app-header-right">
          <button
            type="button"
            class="btn-secondary"
            :disabled="loading"
            @click="loadStats"
          >
            {{ loading ? "Обновление..." : "Обновить" }}
          </button>

          <NuxtLink to="/board" class="btn-secondary">
            К доске
          </NuxtLink>

          <button
            type="button"
            class="btn-danger"
            @click="auth.logout"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>

    <div class="page-container">
      <div class="admin-layout">
        <section class="panel admin-hero">
          <div class="admin-hero-content">
            <div class="admin-badge">
              <span class="admin-badge-dot" />
              Панель администратора
            </div>

            <h1 class="section-title">Сводка по платформе</h1>
            <p class="section-subtitle admin-hero-subtitle">
              Здесь собрана ключевая информация по преподавателям, курсам и занятиям
            </p>
          </div>

          <div class="card-ui admin-user-card">
            <p class="admin-user-label">Текущий пользователь</p>
            <div class="admin-user-name text-safe-wrap">
              {{ auth.user?.fullName || "Администратор" }}
            </div>
            <div class="admin-user-meta muted text-safe-wrap">
              {{ auth.user?.email || "Нет email" }}
            </div>
            <div class="admin-role-pill">
              {{ auth.user?.role || "ADMIN" }}
            </div>
          </div>
        </section>

        <div v-if="errorMessage" class="panel admin-error">
          <p class="admin-error-title">Ошибка</p>
          <p class="admin-error-text">{{ errorMessage }}</p>
        </div>

        <section class="admin-section">
          <div class="section-head">
            <h2 class="section-title">Статистика</h2>
            <p class="section-subtitle">
              Основные показатели по данным из базы
            </p>
          </div>

          <div v-if="loading" class="admin-grid">
            <div
              v-for="n in 6"
              :key="n"
              class="card-ui admin-stat-card admin-stat-card--loading"
            >
              <div class="admin-skeleton admin-skeleton-title" />
              <div class="admin-skeleton admin-skeleton-value" />
              <div class="admin-skeleton admin-skeleton-text" />
            </div>
          </div>

          <div v-else class="admin-grid">
            <article
              v-for="card in statCards"
              :key="card.title"
              class="card-ui admin-stat-card"
            >
              <div class="admin-stat-top">
                <p class="admin-stat-title">{{ card.title }}</p>
              </div>

              <div class="admin-stat-value accent">
                {{ card.value }}
              </div>

              <p class="admin-stat-description muted">
                {{ card.description }}
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
}

.admin-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
  padding: 24px;
}

.admin-hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.admin-hero-subtitle {
  margin-top: 10px;
  max-width: 680px;
  line-height: 1.7;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  margin-bottom: 18px;
  padding: 10px 14px;
  border: 1px solid rgba(0, 220, 130, 0.16);
  border-radius: 999px;
  background: rgba(0, 220, 130, 0.08);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
}

.admin-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 14px rgba(0, 220, 130, 0.45);
}

.admin-user-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 22px;
  min-height: 100%;
  background: linear-gradient(180deg, #181b22 0%, #15181e 100%);
}

.admin-user-label {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.admin-user-name {
  font-size: 22px;
  line-height: 1.3;
  font-weight: 800;
  color: var(--text);
}

.admin-user-meta {
  font-size: 14px;
  line-height: 1.6;
}

.admin-role-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 34px;
  padding: 0 12px;
  margin-top: 4px;
  border: 1px solid rgba(0, 220, 130, 0.2);
  border-radius: 999px;
  background: rgba(0, 220, 130, 0.08);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
}

.admin-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.admin-stat-card {
  padding: 20px;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.admin-stat-card:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 220, 130, 0.22);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
}

.admin-stat-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.admin-stat-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text);
}

.admin-stat-value {
  margin-bottom: 12px;
  font-size: 40px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.admin-stat-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
}

.admin-error {
  padding: 18px 20px;
  border-color: rgba(255, 120, 120, 0.24);
  background: rgba(255, 120, 120, 0.04);
}

.admin-error-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  color: #ff8a8a;
}

.admin-error-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #ffc2c2;
}

.admin-stat-card--loading {
  pointer-events: none;
}

.admin-skeleton {
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: adminShimmer 1.4s infinite linear;
}

.admin-skeleton-title {
  width: 50%;
  height: 18px;
  margin-bottom: 18px;
}

.admin-skeleton-value {
  width: 34%;
  height: 42px;
  margin-bottom: 14px;
}

.admin-skeleton-text {
  width: 100%;
  height: 14px;
}

@keyframes adminShimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1200px) {
  .admin-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .admin-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-hero {
    padding: 20px;
  }

  .admin-grid {
    grid-template-columns: 1fr;
  }

  .admin-stat-value {
    font-size: 34px;
  }
}
</style>
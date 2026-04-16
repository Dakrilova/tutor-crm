<script setup lang="ts">
const auth = useAuthStore()

const form = reactive({
  email: "",
  password: ""
})

const loading = ref(false)
const errorMessage = ref("")

async function handleLogin() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await $fetch<{
      ok: boolean
      user: {
        id: number
        fullName: string
        email: string
        contacts?: string | null
        role: "TEACHER" | "ADMIN"
      }
    }>("/api/auth/login", {
      method: "POST",
      body: {
        email: form.email,
        password: form.password
      }
    })

    if (response?.ok && response.user) {
      auth.setUser(response.user)

      if (response.user.role === "ADMIN") {
        await navigateTo("/admin")
      } else {
        await navigateTo("/board")
      }
    }
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage ||
      error?.message ||
      "Не удалось выполнить вход"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="page-container">
      <div class="login-wrap">
        <section class="panel login-card">
          <div class="login-head">
            <div class="login-badge">
              <span class="login-badge-dot" />
              Вход в систему
            </div>

            <h1 class="section-title">Авторизация</h1>
            <p class="section-subtitle">
              Войдите в аккаунт, чтобы перейти к доске или в панель администратора
            </p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <div class="field-group">
              <label class="field-label" for="email">Email</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="field-input"
                placeholder="Введите email"
                autocomplete="email"
              >
            </div>

            <div class="field-group">
              <label class="field-label" for="password">Пароль</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="field-input"
                placeholder="Введите пароль"
                autocomplete="current-password"
              >
            </div>

            <div v-if="errorMessage" class="login-error">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              class="btn-primary login-submit"
              :disabled="loading"
            >
              {{ loading ? "Входим..." : "Войти" }}
            </button>
          </form>

          <div class="login-footer">
            <span class="muted">Нет аккаунта?</span>
            <NuxtLink to="/register" class="accent">
              Зарегистрироваться
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.login-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 48px);
}

.login-card {
  width: 100%;
  max-width: 520px;
  padding: 28px;
}

.login-head {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.login-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 10px 14px;
  border: 1px solid rgba(0, 220, 130, 0.16);
  border-radius: 999px;
  background: rgba(0, 220, 130, 0.08);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
}

.login-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 14px rgba(0, 220, 130, 0.45);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-submit {
  width: 100%;
}

.login-error {
  padding: 12px 14px;
  border: 1px solid rgba(255, 120, 120, 0.24);
  border-radius: 14px;
  background: rgba(255, 120, 120, 0.04);
  color: #ffb3b3;
  font-size: 14px;
  line-height: 1.5;
}

.login-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .login-card {
    padding: 22px;
  }
}
</style>
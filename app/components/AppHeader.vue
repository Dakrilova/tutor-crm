<template>
  <header class="app-header-shell">
    <div class="app-header">
      <div class="app-header-left">
        <div class="app-brand">
          <div class="app-brand-mark">
            TC
          </div>

          <div class="app-brand-copy">
            <h1 class="app-title">{{ title }}</h1>
            <p v-if="subtitle" class="app-subtitle" v-html="subtitle"></p>
          </div>
        </div>
      </div>

      <div class="app-header-right">
        <div
          v-if="$slots['primary-actions']"
          class="app-header-actions app-header-actions-primary"
        >
          <slot name="primary-actions" />
        </div>

        <div
          v-if="isAuthenticated"
          ref="menuRef"
          class="app-header-menu"
        >
          <button
            class="app-menu-button"
            type="button"
            :aria-expanded="isMenuOpen"
            aria-label="Открыть меню"
            @click.stop="toggleMenu"
          >
            <span class="app-menu-button-icon">✦</span>
            <span>Меню</span>
            <span
              class="app-menu-chevron"
              :class="{ 'app-menu-chevron-open': isMenuOpen }"
            >
              ▾
            </span>
          </button>

          <Transition name="app-dropdown">
            <div
              v-if="isMenuOpen"
              class="app-menu-dropdown"
              @click.stop
            >
              <div class="app-menu-dropdown-head">
                <span>Навигация</span>
                <small>{{ auth.user?.role || "TEACHER" }}</small>
              </div>

              <div class="app-menu-dropdown-actions" @click="closeMenu">
                <NuxtLink to="/" class="btn-secondary">
                  Главная
                </NuxtLink>

                <NuxtLink to="/board" class="btn-secondary">
                  Доска
                </NuxtLink>

                <NuxtLink to="/courses" class="btn-secondary">
                  Курсы
                </NuxtLink>

                <NuxtLink to="/profile" class="btn-secondary">
                  Профиль
                </NuxtLink>

                <NuxtLink
                  v-if="auth.user?.role === 'ADMIN'"
                  to="/admin"
                  class="btn-secondary"
                >
                  Админ-панель
                </NuxtLink>

                <button
                  class="btn-danger"
                  type="button"
                  @click="logout"
                >
                  Выйти
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()

const auth = useAuthStore()

const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const isAuthenticated = computed(() => {
  return !!auth.user
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (!menuRef.value) return

  const target = event.target as Node

  if (!menuRef.value.contains(target)) {
    closeMenu()
  }
}

function logout() {
  closeMenu()
  auth.logout()
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})
</script>

<style scoped>
.app-header-shell {
  width: 100%;
  margin-bottom: 28px;
  border-bottom: 1px solid rgba(0, 220, 130, 0.12);
  background:
    radial-gradient(circle at top left, rgba(0, 220, 130, 0.12), transparent 34%),
    linear-gradient(180deg, rgba(15, 17, 21, 0.96), rgba(2, 3, 4, 0.92));
  backdrop-filter: blur(18px);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 18px 24px 16px;
}

.app-header-left {
  min-width: 0;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.app-brand-mark {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 220, 130, 0.28);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(0, 220, 130, 0.24), rgba(0, 220, 130, 0.05)),
    #10141b;
  color: var(--accent);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.04em;
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.app-brand-copy {
  min-width: 0;
}

.app-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.1;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.app-subtitle {
  margin: 5px 0 0;
  font-size: 14px;
  line-height: 1.4;
  color: var(--muted);
}

.app-subtitle :deep(strong) {
  color: var(--text);
  font-weight: 650;
}

.app-header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.app-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-header-menu {
  position: relative;
}

.app-menu-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid rgba(0, 220, 130, 0.35);
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgba(0, 220, 130, 0.12), rgba(0, 220, 130, 0.03)),
    rgba(15, 23, 42, 0.78);
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  font-weight: 750;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.app-menu-button:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 220, 130, 0.68);
  background:
    linear-gradient(135deg, rgba(0, 220, 130, 0.18), rgba(0, 220, 130, 0.05)),
    rgba(15, 23, 42, 0.92);
  box-shadow: 0 16px 38px rgba(0, 220, 130, 0.08);
}

.app-menu-button-icon {
  color: var(--accent);
  font-size: 13px;
}

.app-menu-chevron {
  color: var(--accent);
  transition: transform 0.2s ease;
}

.app-menu-chevron-open {
  transform: rotate(180deg);
}

.app-menu-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 80;
  width: min(280px, calc(100vw - 32px));
  padding: 10px;
  border: 1px solid rgba(0, 220, 130, 0.2);
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(0, 220, 130, 0.14), transparent 36%),
    #10141b;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.app-menu-dropdown::before {
  content: "";
  position: absolute;
  top: -6px;
  right: 28px;
  width: 12px;
  height: 12px;
  border-left: 1px solid rgba(0, 220, 130, 0.2);
  border-top: 1px solid rgba(0, 220, 130, 0.2);
  background: #10141b;
  transform: rotate(45deg);
}

.app-menu-dropdown-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 9px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  margin-bottom: 8px;
}

.app-menu-dropdown-head span {
  color: var(--text);
  font-size: 13px;
  font-weight: 800;
}

.app-menu-dropdown-head small {
  color: var(--muted);
  font-size: 12px;
}

.app-menu-dropdown-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-menu-dropdown-actions :deep(.btn-secondary),
.app-menu-dropdown-actions :deep(.btn-danger),
.app-menu-dropdown-actions :deep(a),
.app-menu-dropdown-actions :deep(button) {
  width: 100%;
  justify-content: flex-start;
}

.app-dropdown-enter-active,
.app-dropdown-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.app-dropdown-enter-from,
.app-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

@media (max-width: 900px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }

  .app-header-right {
    justify-content: space-between;
  }

  .app-header-actions-primary {
    flex: 1;
  }

  .app-header-actions-primary :deep(.btn-primary),
  .app-header-actions-primary :deep(.btn-secondary),
  .app-header-actions-primary :deep(.btn-danger) {
    width: 100%;
  }

  .app-title {
    font-size: 20px;
  }
}

@media (max-width: 640px) {
  .app-header-right {
    flex-direction: column;
    align-items: stretch;
  }

  .app-header-actions-primary {
    width: 100%;
    flex-direction: column;
  }

  .app-menu-button {
    width: 100%;
  }

  .app-menu-dropdown {
    left: 0;
    right: 0;
    width: 100%;
  }
}
</style>
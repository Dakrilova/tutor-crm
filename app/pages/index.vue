<template>
  <div class="page-container">
    <div class="panel p-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="accent text-sm font-medium mb-2">
            Tutor CRM
          </p>

          <h1 class="section-title mb-3">
            CRM для репетиторов и управления занятиями
          </h1>

          <p class="section-subtitle max-w-2xl">
            Учет статусов занятий, удобная организация расписания
            и простое управление рабочим временем преподавателя.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/login">
            <UButton size="lg">
              Войти
            </UButton>
          </NuxtLink>

          <NuxtLink to="/register">
            <UButton size="lg" variant="outline">
              Регистрация
            </UButton>
          </NuxtLink>

          <NuxtLink to="/board">
            <UButton size="lg" variant="soft">
              Доска
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
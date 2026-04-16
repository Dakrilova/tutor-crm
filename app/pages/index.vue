<template>
  <main class="page-container landing-page">
    <section class="panel hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="hero-badge-dot"></span>
          CRM для репетиторов и мини-групп
        </div>

        <h1 class="hero-title">
          Организуй занятия, статусы и оплату
          <span class="accent">в одном рабочем пространстве</span>
        </h1>

        <p class="hero-description">
          Сервис помогает репетиторам вести свободные слоты, забронированные,
          оплаченные, текущие и завершенные занятия без чатов, звонков и лишних модулей.
        </p>

        <div class="hero-actions">
          <NuxtLink to="/board" class="btn-primary">
            Перейти к доске
          </NuxtLink>

          <NuxtLink to="/profile" class="btn-secondary">
            Профиль преподавателя
          </NuxtLink>
        </div>
      </div>

      <div class="hero-preview card-ui">
        <div class="preview-header">
          <div>
            <div class="preview-title">Учебная доска</div>
            <div class="section-subtitle">Единое управление занятиями</div>
          </div>

          <div class="preview-status">
            <span class="preview-status-dot"></span>
            Активно
          </div>
        </div>

        <div class="preview-columns">
          <div class="preview-column">
            <div class="preview-column-title">Свободные</div>
            <div class="preview-mini-card">
              <div class="preview-mini-card-title">Алгебра 8 класс</div>
              <div class="preview-mini-card-meta">25 марта · 16:00–17:00</div>
            </div>
          </div>

          <div class="preview-column">
            <div class="preview-column-title">Забронированные</div>
            <div class="preview-mini-card">
              <div class="preview-mini-card-title">Английский B1</div>
              <div class="preview-mini-card-meta">Иванов Иван</div>
            </div>
          </div>

          <div class="preview-column">
            <div class="preview-column-title">Оплаченные</div>
            <div class="preview-mini-card">
              <div class="preview-mini-card-title">Группа ОГЭ</div>
              <div class="preview-mini-card-meta">6 учеников</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-section">
      <div class="section-head">
        <h2 class="section-title">Что умеет сервис</h2>
        <p class="section-subtitle">
          Только нужные инструменты для преподавателя, без перегруза интерфейса
        </p>
      </div>

      <div class="feature-grid">
        <article class="card-ui feature-card">
          <div class="feature-icon">01</div>
          <h3 class="feature-title">Kanban по занятиям</h3>
          <p class="feature-text">
            Все занятия распределены по понятным статусам: свободные, забронированные,
            оплаченные, в работе и завершенные.
          </p>
        </article>

        <article class="card-ui feature-card">
          <div class="feature-icon">02</div>
          <h3 class="feature-title">Индивидуально и в группах</h3>
          <p class="feature-text">
            Можно вести как одного ученика, так и учебные группы до 10 человек.
          </p>
        </article>

        <article class="card-ui feature-card">
          <div class="feature-icon">03</div>
          <h3 class="feature-title">Быстрое создание карточек</h3>
          <p class="feature-text">
            Карточка занятия создается прямо на странице со столбцами, без перехода
            на отдельный экран.
          </p>
        </article>

        <article class="card-ui feature-card">
          <div class="feature-icon">04</div>
          <h3 class="feature-title">Ручная отметка оплаты</h3>
          <p class="feature-text">
            Платежей внутри сервиса нет — преподаватель просто отмечает оплаченные занятия.
          </p>
        </article>
      </div>
    </section>

    <section class="landing-section">
      <div class="section-head">
        <h2 class="section-title">Для кого подходит</h2>
        <p class="section-subtitle">
          Система рассчитана на частных преподавателей и небольшие школы
        </p>
      </div>

      <div class="audience-grid">
        <article class="panel audience-card">
          <h3 class="audience-title">Частный репетитор</h3>
          <p class="audience-text">
            Для преподавателя, который сам ведет расписание, учеников и оплату.
          </p>
        </article>

        <article class="panel audience-card">
          <h3 class="audience-title">Мини-группа</h3>
          <p class="audience-text">
            Для занятий с несколькими учениками, когда важно видеть статус группы и ссылку на урок.
          </p>
        </article>

        <article class="panel audience-card">
          <h3 class="audience-title">Небольшая школа</h3>
          <p class="audience-text">
            В будущем сервис можно расширить до школ, администрирования и статистики по преподавателям.
          </p>
        </article>
      </div>
    </section>

    <section class="panel cta-section">
      <div>
        <h2 class="section-title">Минималистичный инструмент для работы преподавателя</h2>
        <p class="section-subtitle">
          Без чатов, без звонков, без встроенных оплат — только организация времени и занятий
        </p>
      </div>

      <div class="cta-actions">
        <NuxtLink to="/board" class="btn-primary">
          Открыть доску
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
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

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-section {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  align-items: stretch;
  gap: 24px;
  padding: 28px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-badge {
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
}

.hero-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 14px rgba(0, 220, 130, 0.45);
}

.hero-title {
  max-width: 760px;
  margin: 0;
  font-size: 48px;
  line-height: 1.06;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.hero-description {
  max-width: 680px;
  margin: 18px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--muted);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

.hero-preview {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100%;
  padding: 18px;
  background: linear-gradient(180deg, #181b22 0%, #15181e 100%);
}

.preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.preview-title {
  font-size: 18px;
  font-weight: 700;
}

.preview-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(0, 220, 130, 0.2);
  border-radius: 999px;
  background: rgba(0, 220, 130, 0.08);
  color: var(--accent);
  font-size: 12px;
  white-space: nowrap;
}

.preview-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}

.preview-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.preview-column {
  min-height: 180px;
  padding: 14px;
  border: 1px solid #252c38;
  border-radius: 16px;
  background: #10141b;
}

.preview-column-title {
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
}

.preview-mini-card {
  padding: 12px;
  border: 1px solid #2a313d;
  border-radius: 14px;
  background: #171c24;
}

.preview-mini-card-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.preview-mini-card-meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--muted);
}

.landing-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.feature-card {
  padding: 20px;
  background: #1a1d24;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 220, 130, 0.22);
  border-radius: 12px;
  background: rgba(0, 220, 130, 0.08);
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
}

.feature-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.feature-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted);
}

.audience-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.audience-card {
  padding: 22px;
}

.audience-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
}

.audience-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted);
}

.cta-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 28px;
}

.cta-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 1200px) {
  .hero-section {
    grid-template-columns: 1fr;
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .audience-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-section,
  .cta-section {
    padding: 20px;
  }

  .hero-title {
    font-size: 34px;
  }

  .preview-columns,
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions,
  .cta-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .cta-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
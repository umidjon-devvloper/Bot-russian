-- OmniFind PostgreSQL Schema
-- Полная схема для деплоя

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. USERS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(100),
  photo_url TEXT,
  role VARCHAR(20) DEFAULT 'specialist', -- specialist | customer | both | admin
  country VARCHAR(100),
  city VARCHAR(100),
  bio TEXT,
  profile_completion INT DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  onboarding_complete BOOLEAN DEFAULT false,
  selected_role VARCHAR(20),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. SPECIALIST PROFILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS specialist_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization VARCHAR(200),
  primary_category_id BIGINT, -- основная категория (для фильтра в каталоге)
  status VARCHAR(20) DEFAULT 'candidate', -- candidate | master | expert | top
  rating NUMERIC(3,2) DEFAULT 0.00,
  total_contacts INT DEFAULT 0,
  total_reviews INT DEFAULT 0,
  total_deals INT DEFAULT 0,
  avg_quality NUMERIC(2,1) DEFAULT 0.0,
  avg_timing NUMERIC(2,1) DEFAULT 0.0,
  avg_communication NUMERIC(2,1) DEFAULT 0.0,
  safe_deal_enabled BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration (idempotent) — добавить колонку primary_category_id, если её ещё нет
ALTER TABLE specialist_profiles ADD COLUMN IF NOT EXISTS primary_category_id BIGINT REFERENCES categories(id);

-- ─── 3. CUSTOMER PROFILES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(200),
  inn_ogrn VARCHAR(50),
  total_publications INT DEFAULT 0,
  total_hires INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'new', -- new | verified | company
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. CATEGORIES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(10),
  emoji VARCHAR(10),
  parent_id BIGINT REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. SERVICES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  what_included JSONB,
  deadline_value INT,
  deadline_unit VARCHAR(10),
  price NUMERIC(10,2) NOT NULL,
  currency VARCHAR(5) DEFAULT 'RUB',
  safe_deal BOOLEAN DEFAULT true,
  tags JSONB,
  status VARCHAR(20) DEFAULT 'active', -- pending | active | archived | rejected
  rejection_reason TEXT,
  views INT DEFAULT 0,
  contact_clicks INT DEFAULT 0,
  avg_rating NUMERIC(2,1) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. SERVICE IMAGES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_images (
  id BIGSERIAL PRIMARY KEY,
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. PORTFOLIOS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolios (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id BIGINT REFERENCES services(id),
  description TEXT,
  tags JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. PORTFOLIO IMAGES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_images (
  id BIGSERIAL PRIMARY KEY,
  portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 9. EXTERNAL LINKS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS external_links (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  link_type VARCHAR(30) NOT NULL,
  url TEXT NOT NULL,
  title VARCHAR(100),
  is_visible BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. REVIEWS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  service_id BIGINT REFERENCES services(id),
  customer_id BIGINT NOT NULL REFERENCES users(id),
  specialist_id BIGINT NOT NULL REFERENCES users(id),
  contact_id BIGINT,
  overall VARCHAR(10), -- thumbs_up | neutral | thumbs_down
  quality_rating INT,
  timing_rating INT,
  communication_rating INT,
  text TEXT,
  specialist_reply TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 11. CONTACTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  service_id BIGINT REFERENCES services(id),
  customer_id BIGINT NOT NULL REFERENCES users(id),
  specialist_id BIGINT NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'chat', -- chat | deal_started | completed | cancelled
  confirmed_by_customer BOOLEAN DEFAULT false,
  confirmed_by_specialist BOOLEAN DEFAULT false,
  deal_amount NUMERIC(10,2),
  deal_deadline VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 12. DEALS (Логи сделок) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT REFERENCES contacts(id),
  customer_id BIGINT NOT NULL REFERENCES users(id),
  specialist_id BIGINT NOT NULL REFERENCES users(id),
  service_title VARCHAR(200),
  amount NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'completed', -- completed | cancelled
  tg_message_id BIGINT, -- id сообщения в топике логов
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 13. TENDERS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id BIGINT REFERENCES categories(id),
  budget NUMERIC(10,2),
  deadline VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  priority VARCHAR(20) DEFAULT 'normal',
  views INT DEFAULT 0,
  responses INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 14. FAVORITES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- ─── 15. CHANNEL PUBLICATIONS (Вакансии) ────────────────────────────────
CREATE TABLE IF NOT EXISTS channel_publications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  budget VARCHAR(100),
  contact_info VARCHAR(200),
  channels JSONB, -- массив id каналов куда публикуем
  status VARCHAR(20) DEFAULT 'pending', -- pending | published | rejected
  tg_message_ids JSONB, -- id сообщений по каналам
  reviewed_by BIGINT REFERENCES users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 16. BOT SETTINGS (Настройки бота, топиков) ─────────────────────────
CREATE TABLE IF NOT EXISTS bot_settings (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  description VARCHAR(200),
  updated_by BIGINT REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 17. PUBLICATION CHANNELS (Каналы для вакансий) ─────────────────────
CREATE TABLE IF NOT EXISTS publication_channels (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tg_channel_id BIGINT NOT NULL UNIQUE,
  username VARCHAR(100),
  description TEXT,
  members_count INT DEFAULT 0,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 18. NOTIFICATIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 19. MODERATION LOG ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS moderation_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT REFERENCES users(id),
  target_type VARCHAR(30) NOT NULL,
  target_id BIGINT NOT NULL,
  action VARCHAR(30) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DEFAULT DATA ────────────────────────────────────────────────────────

INSERT INTO categories (name, slug, emoji, sort_order) VALUES
  ('Дизайн', 'design', '🎨', 1),
  ('Разработка', 'development', '💻', 2),
  ('Маркетинг', 'marketing', '📣', 3),
  ('Копирайтинг', 'copywriting', '✍️', 4),
  ('Видео и фото', 'media', '📸', 5),
  ('SEO', 'seo', '🔍', 6),
  ('Консалтинг', 'consulting', '🤝', 7),
  ('Монтаж и строительство', 'construction', '🔧', 8),
  ('Переводы', 'translation', '🌐', 9),
  ('Другое', 'other', '📦', 10)
ON CONFLICT (slug) DO NOTHING;

-- Настройки бота по умолчанию
INSERT INTO bot_settings (key, value, description) VALUES
  ('group_id', '', 'ID группы Telegram'),
  ('topic_specialists', '', 'ID топика "Анкеты специалистов"'),
  ('topic_deals', '', 'ID топика "Логи сделок"'),
  ('topic_tenders', '', 'ID топика "Тендеры/заказы"'),
  ('topic_news', '', 'ID топика "Новости платформы"'),
  ('miniapp_url', '', 'URL Mini App'),
  ('deals_gif_file_id', '', 'File ID гифки для логов сделок'),
  ('btn_catalog_text', 'Все анкеты', 'Текст кнопки каталога в анкетах'),
  ('btn_register_text', 'Верификация', 'Текст кнопки регистрации в анкетах'),
  ('chat_rules', 
   '📋 *ПРАВИЛА ОБЩЕГО ЧАТА*\n\n✅ *Разрешено:*\n— Поиск специалистов и заказчиков\n— Обсуждение проектов\n— Прямые договорённости между пользователями\n— Вопросы о платформе\n\n❌ *Запрещено:*\n— Спам и флуд\n— Оскорбления и агрессия\n— Реклама сторонних бирж\n— Фейки и мошенничество\n\n⚡️ Нарушения — предупреждение → бан.',
   'Правила чата')
ON CONFLICT (key) DO NOTHING;

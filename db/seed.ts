import { getDb } from "../api/queries/connection";
import {
  users,
  specialistProfiles,
  customerProfiles,
  categories,
  services,
  portfolios,
  reviews,
  externalLinks,
  contacts,
  subscriptions,
  tenders,
  topics,
  autoPostTemplates,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // ─── Categories ───────────────────────────────────────────────────────
  const cats = await db.insert(categories).values([
    { name: "Дизайн", slug: "design", emoji: "🎨", sortOrder: 1 },
    { name: "IT и разработка", slug: "it-dev", emoji: "💻", sortOrder: 2 },
    { name: "Бухгалтерия и финансы", slug: "accounting", emoji: "📊", sortOrder: 3 },
    { name: "Ремонт и стройка", slug: "repair", emoji: "🛠", sortOrder: 4 },
    { name: "Красота и здоровье", slug: "beauty", emoji: "💅", sortOrder: 5 },
    { name: "Репетиторы и обучение", slug: "tutoring", emoji: "👩‍🏫", sortOrder: 6 },
    { name: "Маркетинг и реклама", slug: "marketing", emoji: "📈", sortOrder: 7 },
    { name: "Копирайтинг", slug: "copywriting", emoji: "✍️", sortOrder: 8 },
    { name: "Фото и видео", slug: "photo-video", emoji: "📸", sortOrder: 9 },
    { name: "Юридические услуги", slug: "legal", emoji: "⚖️", sortOrder: 10 },
  ]).$returningId();
  console.log("Categories seeded:", cats.length);

  // ─── Users (Specialists) ──────────────────────────────────────────────
  const specialistsData = [
    { telegramId: 10001, firstName: "Алексей", lastName: "Морозов", username: "morozov_design", country: "Россия", city: "Москва", bio: "Графический дизайнер с 8-летним опытом. Специализация — фирменный стиль и упаковка. Работал с Сбер, Яндекс, Тинькофф.", selectedRole: "specialist" },
    { telegramId: 10002, firstName: "Екатерина", lastName: "Соколова", username: "sokolova_ui", country: "Россия", city: "Санкт-Петербург", bio: "UI/UX дизайнер. Делаю интерфейсы, которые продают. 50+ проектов в портфолио.", selectedRole: "specialist" },
    { telegramId: 10003, firstName: "Дмитрий", lastName: "Волков", username: "volkov_dev", country: "Россия", city: "Казань", bio: "Fullstack разработчик. React, Node.js, PostgreSQL. Быстро, качественно, с гарантией.", selectedRole: "specialist" },
    { telegramId: 10004, firstName: "Анна", lastName: "Павлова", username: "pavlova_beauty", country: "Россия", city: "Москва", bio: "Визажист-бровист. Обучение у лучших мастеров Европы. Использую премиальную косметику.", selectedRole: "specialist" },
    { telegramId: 10005, firstName: "Максим", lastName: "Козлов", username: "kozlov_seo", country: "Беларусь", city: "Минск", bio: "SEO-специалист с 6-летним опытом. Вывел 30+ сайтов в топ-10. Гарантия результата.", selectedRole: "specialist" },
    { telegramId: 10006, firstName: "Ольга", lastName: "Новикова", username: "novikova_copy", country: "Россия", city: "Екатеринбург", bio: "Копирайтер, контент-стратег. Пишу тексты, которые продают. Сотрудничаю с крупными брендами.", selectedRole: "specialist" },
    { telegramId: 10007, firstName: "Иван", lastName: "Лебедев", username: "lebedev_photo", country: "Казахстан", city: "Алматы", bio: "Профессиональный фотограф. Свадьбы, портреты, реклама. Съёмка по всему СНГ.", selectedRole: "specialist" },
    { telegramId: 10008, firstName: "Мария", lastName: "Кузнецова", username: "kuznetsova_1c", country: "Россия", city: "Новосибирск", bio: "Программист 1С. Внедрение, доработка, сопровождение. Сертифицированный специалист.", selectedRole: "specialist" },
    { telegramId: 10009, firstName: "Артём", lastName: "Семёнов", username: "seminov_repair", country: "Россия", city: "Самара", bio: "Ремонт квартир под ключ. 12 лет опыта. Своя бригада. Гарантия 3 года на все работы.", selectedRole: "specialist" },
    { telegramId: 10010, firstName: "Татьяна", lastName: "Егорова", username: "egorova_legal", country: "Россия", city: "Москва", bio: "Юрист по гражданскому и налоговому праву. 15 лет практики. Решаю сложные кейсы.", selectedRole: "specialist" },
    { telegramId: 10011, firstName: "Сергей", lastName: "Попов", username: "popov_target", country: "Россия", city: "Сочи", bio: "Таргетолог. Настройка рекламы VK, Яндекс, Telegram. ROI от 300%.", selectedRole: "specialist" },
    { telegramId: 10012, firstName: "Наталья", lastName: "Васильева", username: "vasilieva_tutor", country: "Россия", city: "Краснодар", bio: "Репетитор по математике и физике. Подготовка к ЕГЭ и ОГЭ. 90% учеников на 80+ баллов.", selectedRole: "specialist" },
    { telegramId: 10013, firstName: "Павел", lastName: "Петров", username: "petrov_motion", country: "Узбекистан", city: "Ташкент", bio: "Motion-дизайнер. Анимация логотипов, рекламные ролики, презентации. After Effects, Cinema 4D.", selectedRole: "specialist" },
    { telegramId: 10014, firstName: "Елена", lastName: "Смирнова", username: "smirnova_smm", country: "Россия", city: "Уфа", bio: "SMM-менеджер. Ведение соцсетей, стратегии, контент-планы. Рост подписчиков от 0 до 50K.", selectedRole: "specialist" },
    { telegramId: 10015, firstName: "Андрей", lastName: "Макаров", username: "makarov_mobile", country: "Россия", city: "Владивосток", bio: "Разработка мобильных приложений iOS и Android. Flutter, React Native. 20+ приложений в сторах.", selectedRole: "specialist" },
  ];

  const specIds = [] as number[];
  for (const s of specialistsData) {
    const [{ id: uid }] = await db.insert(users).values({ ...s, onboardingComplete: true }).$returningId();
    specIds.push(uid);
  }
  console.log("Specialist users seeded:", specIds.length);

  // ─── Specialist Profiles ──────────────────────────────────────────────
  const profileData = [
    { userId: specIds[0], specialization: "Графический дизайн, фирменный стиль", status: "top", rating: "4.92", totalContacts: 127, totalReviews: 48, totalDeals: 56, avgQuality: "5.0", avgTiming: "4.8", avgCommunication: "5.0" },
    { userId: specIds[1], specialization: "UI/UX дизайн, прототипирование", status: "expert", rating: "4.85", totalContacts: 89, totalReviews: 34, totalDeals: 38, avgQuality: "4.9", avgTiming: "4.7", avgCommunication: "4.9" },
    { userId: specIds[2], specialization: "Fullstack разработка", status: "master", rating: "4.78", totalContacts: 65, totalReviews: 22, totalDeals: 25, avgQuality: "4.8", avgTiming: "4.6", avgCommunication: "4.9" },
    { userId: specIds[3], specialization: "Визаж, брови, макияж", status: "expert", rating: "4.95", totalContacts: 156, totalReviews: 67, totalDeals: 72, avgQuality: "5.0", avgTiming: "4.9", avgCommunication: "4.9" },
    { userId: specIds[4], specialization: "SEO-продвижение, аудит", status: "master", rating: "4.65", totalContacts: 43, totalReviews: 18, totalDeals: 20, avgQuality: "4.7", avgTiming: "4.5", avgCommunication: "4.6" },
    { userId: specIds[5], specialization: "Копирайтинг, контент-стратегия", status: "top", rating: "4.88", totalContacts: 98, totalReviews: 41, totalDeals: 45, avgQuality: "4.9", avgTiming: "4.8", avgCommunication: "4.9" },
    { userId: specIds[6], specialization: "Фотосъёмка, видеосъёмка", status: "master", rating: "4.72", totalContacts: 72, totalReviews: 28, totalDeals: 30, avgQuality: "4.8", avgTiming: "4.6", avgCommunication: "4.7" },
    { userId: specIds[7], specialization: "1С программирование, внедрение", status: "expert", rating: "4.81", totalContacts: 54, totalReviews: 19, totalDeals: 22, avgQuality: "4.9", avgTiming: "4.5", avgCommunication: "5.0" },
    { userId: specIds[8], specialization: "Ремонт квартир под ключ", status: "top", rating: "4.90", totalContacts: 134, totalReviews: 52, totalDeals: 58, avgQuality: "4.9", avgTiming: "4.8", avgCommunication: "5.0" },
    { userId: specIds[9], specialization: "Юридические консультации", status: "expert", rating: "4.87", totalContacts: 76, totalReviews: 31, totalDeals: 35, avgQuality: "5.0", avgTiming: "4.7", avgCommunication: "4.9" },
    { userId: specIds[10], specialization: "Таргетированная реклама", status: "master", rating: "4.70", totalContacts: 51, totalReviews: 20, totalDeals: 23, avgQuality: "4.7", avgTiming: "4.6", avgCommunication: "4.8" },
    { userId: specIds[11], specialization: "Подготовка к ЕГЭ, математика", status: "master", rating: "4.75", totalContacts: 38, totalReviews: 15, totalDeals: 18, avgQuality: "4.8", avgTiming: "4.7", avgCommunication: "4.7" },
    { userId: specIds[12], specialization: "Motion-дизайн, анимация", status: "expert", rating: "4.83", totalContacts: 62, totalReviews: 24, totalDeals: 27, avgQuality: "4.9", avgTiming: "4.7", avgCommunication: "4.9" },
    { userId: specIds[13], specialization: "SMM, ведение соцсетей", status: "master", rating: "4.68", totalContacts: 47, totalReviews: 19, totalDeals: 21, avgQuality: "4.7", avgTiming: "4.5", avgCommunication: "4.8" },
    { userId: specIds[14], specialization: "Мобильная разработка", status: "expert", rating: "4.79", totalContacts: 58, totalReviews: 23, totalDeals: 26, avgQuality: "4.8", avgTiming: "4.7", avgCommunication: "4.9" },
  ];

  await db.insert(specialistProfiles).values(profileData);
  console.log("Specialist profiles seeded:", profileData.length);

  // ─── Services ─────────────────────────────────────────────────────────
  const servicesData = [
    { userId: specIds[0], categoryId: cats[0], title: "Фирменный стиль для бизнеса", description: "Разработка логотипа, цветовой палитры, типографики, носителей фирменного стиля. Полный комплект для узнаваемости бренда.", whatIncluded: JSON.stringify(["Логотип", "Цветовая палитра", "Шрифты", "Визитки", "Бланки", "Руководство по стилю"]), deadlineValue: 14, deadlineUnit: "days", price: "45000.00", tags: JSON.stringify(["фирменный стиль", "логотип", "брендинг", "дизайн"]), status: "active", avgRating: "4.9" },
    { userId: specIds[0], categoryId: cats[0], title: "Дизайн упаковки продукта", description: "Создание уникальной упаковки, которая выделяет продукт на полке. От концепции до готовых макетов.", whatIncluded: JSON.stringify(["Исследование рынка", "3 концепции", "Доработка выбранной", "Макеты для типографии"]), deadlineValue: 10, deadlineUnit: "days", price: "35000.00", tags: JSON.stringify(["упаковка", "дизайн", "продукт"]), status: "active", avgRating: "5.0" },
    { userId: specIds[1], categoryId: cats[0], title: "Дизайн мобильного приложения", description: "UI/UX дизайн iOS и Android приложений. От прототипов до финальных макетов в Figma.", whatIncluded: JSON.stringify(["Прототип", "UI-kit", "Экраны приложения", "Анимации", "Подготовка к разработке"]), deadlineValue: 21, deadlineUnit: "days", price: "80000.00", tags: JSON.stringify(["UI", "UX", "мобильное приложение", "Figma"]), status: "active", avgRating: "4.8" },
    { userId: specIds[1], categoryId: cats[0], title: "Дизайн Landing Page", description: "Продающий дизайн одностраничного сайта. Анализ ЦА, структура, визуал, адаптив.", whatIncluded: JSON.stringify(["Анализ ЦА", "Структура страницы", "Дизайн десктоп", "Дизайн мобильный", "UI-kit"]), deadlineValue: 7, deadlineUnit: "days", price: "30000.00", tags: JSON.stringify(["лендинг", "landing page", "веб-дизайн"]), status: "active", avgRating: "4.9" },
    { userId: specIds[2], categoryId: cats[1], title: "Разработка Telegram-бота", description: "Создание ботов любой сложности на Python. Интеграция с CRM, платежами, базами данных.", whatIncluded: JSON.stringify(["Техническое задание", "Разработка", "Тестирование", "Деплой", "Поддержка 1 мес"]), deadlineValue: 5, deadlineUnit: "days", price: "25000.00", tags: JSON.stringify(["Telegram", "бот", "Python", "автоматизация"]), status: "active", avgRating: "4.7" },
    { userId: specIds[2], categoryId: cats[1], title: "Разработка веб-приложения на React", description: "Современные SPA на React + TypeScript + Tailwind. Быстрая разработка, чистый код.", whatIncluded: JSON.stringify(["Архитектура", "Разработка фронтенда", "Интеграция API", "Тестирование", "Деплой"]), deadlineValue: 14, deadlineUnit: "days", price: "60000.00", tags: JSON.stringify(["React", "TypeScript", "веб-приложение", "фронтенд"]), status: "active", avgRating: "4.8" },
    { userId: specIds[3], categoryId: cats[4], title: "Макияж для фотосессии", description: "Профессиональный макияж любой сложности. Подготовка к фото и видеосъёмке, мероприятиям.", whatIncluded: JSON.stringify(["Консультация", "Подготовка кожи", "Макияж", "Фиксация", "Коррекция"]), deadlineValue: 1, deadlineUnit: "days", price: "5000.00", tags: JSON.stringify(["макияж", "визаж", "фотосессия"]), status: "active", avgRating: "5.0" },
    { userId: specIds[3], categoryId: cats[4], title: "Оформление бровей", description: "Архитектура бровей, окрашивание, ламинирование. Индивидуальный подбор формы.", whatIncluded: JSON.stringify(["Коррекция", "Окрашивание", "Ламинирование", "Уходовые средства"]), deadlineValue: 1, deadlineUnit: "days", price: "2500.00", tags: JSON.stringify(["брови", "ламинирование", "окрашивание"]), status: "active", avgRating: "4.9" },
    { userId: specIds[4], categoryId: cats[6], title: "SEO-аудит сайта", description: "Полный технический и контентный аудит. Чек-лист ошибок и рекомендации по исправлению.", whatIncluded: JSON.stringify(["Технический аудит", "Контентный анализ", "Анализ конкурентов", "Чек-лист", "Рекомендации"]), deadlineValue: 3, deadlineUnit: "days", price: "15000.00", tags: JSON.stringify(["SEO", "аудит", "продвижение", "сайт"]), status: "active", avgRating: "4.6" },
    { userId: specIds[4], categoryId: cats[6], title: "SEO-продвижение (3 мес)", description: "Комплексное продвижение сайта. Рост трафика и позиций. Ежемесячная отчётность.", whatIncluded: JSON.stringify(["Анализ ниши", "Внутренняя оптимизация", "Ссылки", "Контент", "Отчёты"]), deadlineValue: 90, deadlineUnit: "days", price: "45000.00", tags: JSON.stringify(["SEO", "продвижение", "трафик", "топ-10"]), status: "active", avgRating: "4.7" },
    { userId: specIds[5], categoryId: cats[7], title: "Копирайтинг для сайта", description: "Продающие тексты для Landing Page, корпоративных сайтов, интернет-магазинов.", whatIncluded: JSON.stringify(["Анализ ЦА", "3 варианта заголовка", "Тексты для всех блоков", "CTA", "Доработки"]), deadlineValue: 5, deadlineUnit: "days", price: "12000.00", tags: JSON.stringify(["копирайтинг", "тексты", "сайт", "продажи"]), status: "active", avgRating: "4.9" },
    { userId: specIds[5], categoryId: cats[7], title: "Сценарий для видеоролика", description: "Сценарии для рекламных роликов, reels, TikTok. Цепляющие хуки и структура.", whatIncluded: JSON.stringify(["Исследование", "Хуки", "Сценарий", "Советы по съёмке"]), deadlineValue: 3, deadlineUnit: "days", price: "8000.00", tags: JSON.stringify(["сценарий", "видео", "реклама", "TikTok"]), status: "active", avgRating: "4.8" },
    { userId: specIds[6], categoryId: cats[8], title: "Профессиональная фотосессия", description: "Индивидуальная, семейная, предметная фотосъёмка. Студия или выезд.", whatIncluded: JSON.stringify(["Консультация", "Съёмка 2 часа", "Обработка 30 фото", "Цветокоррекция", "Исходники"]), deadlineValue: 3, deadlineUnit: "days", price: "15000.00", tags: JSON.stringify(["фотосессия", "портрет", "предметка"]), status: "active", avgRating: "4.8" },
    { userId: specIds[7], categoryId: cats[2], title: "Внедрение 1С:Управление торговлей", description: "Настройка и внедрение 1С под ваш бизнес. Обучение персонала.", whatIncluded: JSON.stringify(["Аудит", "Настройка", "Загрузка данных", "Обучение", "Поддержка"]), deadlineValue: 14, deadlineUnit: "days", price: "55000.00", tags: JSON.stringify(["1С", "внедрение", "торговля", "автоматизация"]), status: "active", avgRating: "4.8" },
    { userId: specIds[8], categoryId: cats[3], title: "Ремонт квартиры под ключ", description: "Полный ремонт от демонтажа до финальной отделки. Своя бригада, материалы по себестоимости.", whatIncluded: JSON.stringify(["Дизайн-проект", "Демонтаж", "Черновые работы", "Чистовая отделка", "Уборка"]), deadlineValue: 60, deadlineUnit: "days", price: "250000.00", tags: JSON.stringify(["ремонт", "квартира", "под ключ", "отделка"]), status: "active", avgRating: "4.9" },
    { userId: specIds[9], categoryId: cats[9], title: "Консультация юриста", description: "Устная или письменная консультация по гражданскому, налоговому, трудовому праву.", whatIncluded: JSON.stringify(["Анализ ситуации", "Правовая оценка", "Рекомендации", "Ссылка на закон"]), deadlineValue: 1, deadlineUnit: "days", price: "5000.00", tags: JSON.stringify(["юрист", "консультация", "право"]), status: "active", avgRating: "4.9" },
    { userId: specIds[10], categoryId: cats[6], title: "Настройка VK Рекламы", description: "Запуск и ведение рекламных кампаний VK. Таргет на вашу ЦА. A/B тесты.", whatIncluded: JSON.stringify(["Анализ ЦА", "Создание объявлений", "A/B тест", "Оптимизация", "Отчёт"]), deadlineValue: 3, deadlineUnit: "days", price: "12000.00", tags: JSON.stringify(["VK", "таргет", "реклама", "привлечение"]), status: "active", avgRating: "4.7" },
    { userId: specIds[11], categoryId: cats[5], title: "Подготовка к ЕГЭ по математике", description: "Индивидуальные занятия. Профильный уровень. От 60 до 90+ баллов.", whatIncluded: JSON.stringify(["Диагностика", "План занятий", "20 уроков", "Пробники", "Сопровождение"]), deadlineValue: 90, deadlineUnit: "days", price: "30000.00", tags: JSON.stringify(["ЕГЭ", "математика", "подготовка", "репетитор"]), status: "active", avgRating: "4.8" },
    { userId: specIds[12], categoryId: cats[0], title: "Анимация логотипа", description: "Создание динамичной анимации вашего логотипа для видео, презентаций, сайта.", whatIncluded: JSON.stringify(["3 концепции", "Анимация", "Звуковое сопровождение", "Форматы MP4, GIF, SVG"]), deadlineValue: 5, deadlineUnit: "days", price: "18000.00", tags: JSON.stringify(["анимация", "логотип", "motion", "видео"]), status: "active", avgRating: "4.8" },
    { userId: specIds[13], categoryId: cats[6], title: "Ведение Instagram (1 мес)", description: "Полное ведение профиля: контент, сторис, reels, взаимодействие с аудиторией.", whatIncluded: JSON.stringify(["Контент-план", "15 постов", "30 сторис", "3 reels", "Отчёт"]), deadlineValue: 30, deadlineUnit: "days", price: "25000.00", tags: JSON.stringify(["Instagram", "SMM", "ведение", "контент"]), status: "active", avgRating: "4.7" },
    { userId: specIds[14], categoryId: cats[1], title: "Разработка мобильного приложения Flutter", description: "Кроссплатформенное приложение на Flutter. iOS + Android из одного кода.", whatIncluded: JSON.stringify(["Проектирование", "Разработка", "Тестирование", "Публикация", "Поддержка"]), deadlineValue: 30, deadlineUnit: "days", price: "120000.00", tags: JSON.stringify(["Flutter", "iOS", "Android", "мобильное приложение"]), status: "active", avgRating: "4.8" },
    { userId: specIds[0], categoryId: cats[0], title: "Презентация компании", description: "Дизайн презентации для инвесторов, партнёров, клиентов. PowerPoint / Keynote / Figma.", whatIncluded: JSON.stringify(["Структура", "Дизайн слайдов", "Инфографика", "Анимации", "Финальный файл"]), deadlineValue: 7, deadlineUnit: "days", price: "20000.00", tags: JSON.stringify(["презентация", "дизайн", "инвесторы"]), status: "active", avgRating: "4.8" },
    { userId: specIds[3], categoryId: cats[4], title: "Ламинирование ресниц", description: "Долговременная укладка и ламинирование ресниц. Эффект до 8 недель.", whatIncluded: JSON.stringify(["Очищение", "Ламинирование", "Окрашивание", "Ботокс"]), deadlineValue: 1, deadlineUnit: "days", price: "3000.00", tags: JSON.stringify(["ресницы", "ламинирование", "окрашивание"]), status: "active", avgRating: "5.0" },
    { userId: specIds[9], categoryId: cats[9], title: "Договорная работа", description: "Составление, проверка, анализ договоров. Защита интересов вашего бизнеса.", whatIncluded: JSON.stringify(["Анализ договора", "Правки", "Замечания", "Рекомендации"]), deadlineValue: 2, deadlineUnit: "days", price: "8000.00", tags: JSON.stringify(["договор", "юрист", "проверка"]), status: "active", avgRating: "4.9" },
  ];

  const svcIds = [] as number[];
  for (const svc of servicesData) {
    const [{ id }] = await db.insert(services).values(svc).$returningId();
    svcIds.push(id);
  }
  console.log("Services seeded:", svcIds.length);

  // ─── Customer Users ───────────────────────────────────────────────────
  const customerUsers = [
    { telegramId: 20001, firstName: "ООО", lastName: "СтройГранд", username: "stroygrand", country: "Россия", city: "Москва", bio: "Крупная строительная компания. Ищем надёжных подрядчиков.", selectedRole: "customer", onboardingComplete: true },
    { telegramId: 20002, firstName: "Алексей", lastName: "Воронов", username: "voronov_al", country: "Россия", city: "Санкт-Петербург", bio: "Владелец сети кофеен. Нужен постоянный дизайнер.", selectedRole: "customer", onboardingComplete: true },
    { telegramId: 20003, firstName: "Марина", lastName: "Козлова", username: "kozlova_m", country: "Россия", city: "Екатеринбург", bio: "Маркетинг-директор IT-компании. Ищу копирайтера и SMM-щика.", selectedRole: "customer", onboardingComplete: true },
    { telegramId: 20004, firstName: "ИП", lastName: "Григорьев", username: "grigoriev_ip", country: "Россия", city: "Казань", bio: "Предприниматель. Нужен сайт и продвижение.", selectedRole: "customer", onboardingComplete: true },
  ];

  const custIds = [] as number[];
  for (const c of customerUsers) {
    const [{ id: uid }] = await db.insert(users).values(c).$returningId();
    custIds.push(uid);
  }

  await db.insert(customerProfiles).values([
    { userId: custIds[0], companyName: "ООО СтройГранд", innOgrn: "7701234567", status: "company", totalPublications: 5, totalHires: 12 },
    { userId: custIds[1], status: "verified", totalPublications: 3, totalHires: 8 },
    { userId: custIds[2], companyName: "IT-Pro", status: "company", totalPublications: 8, totalHires: 15 },
    { userId: custIds[3], status: "verified", totalPublications: 2, totalHires: 4 },
  ]);
  console.log("Customers seeded:", custIds.length);

  // ─── Reviews ──────────────────────────────────────────────────────────
  const reviewData = [
    { serviceId: svcIds[0], customerId: custIds[0], specialistId: specIds[0], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Отличная работа! Логотип превзошёл ожидания. Рекомендую всем.", status: "approved" },
    { serviceId: svcIds[0], customerId: custIds[1], specialistId: specIds[0], overall: "thumbs_up", qualityRating: 5, timingRating: 4, communicationRating: 5, text: "Алексей — профессионал высшего класса. Работа выполнена в срок, все правки учтены.", status: "approved" },
    { serviceId: svcIds[2], customerId: custIds[3], specialistId: specIds[1], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 4, text: "Дизайн приложения получился крутым. Пользователи в восторге.", status: "approved" },
    { serviceId: svcIds[6], customerId: custIds[2], specialistId: specIds[3], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Лучший визажист в городе! Макияж держался весь день съёмки.", status: "approved" },
    { serviceId: svcIds[6], customerId: custIds[1], specialistId: specIds[3], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Анна — волшебница! Каждый раз уникальный образ. Рекомендую!", status: "approved" },
    { serviceId: svcIds[9], customerId: custIds[3], specialistId: specIds[4], overall: "thumbs_up", qualityRating: 4, timingRating: 4, communicationRating: 5, text: "Хороший аудит, нашли много ошибок. Трафик вырос на 40%.", status: "approved" },
    { serviceId: svcIds[10], customerId: custIds[2], specialistId: specIds[5], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Тексты продают! Конверсия выросла в 2 раза. Будем работать дальше.", status: "approved" },
    { serviceId: svcIds[12], customerId: custIds[1], specialistId: specIds[6], overall: "thumbs_up", qualityRating: 5, timingRating: 4, communicationRating: 5, text: "Потрясающие фото! Иван лучший в своём деле.", status: "approved" },
    { serviceId: svcIds[14], customerId: custIds[0], specialistId: specIds[8], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Ремонт сделан идеально. Всё в срок, без накруток. Рекомендую!", status: "approved" },
    { serviceId: svcIds[15], customerId: custIds[2], specialistId: specIds[9], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 4, text: "Грамотная консультация. Помогла разобраться в сложной ситуации.", status: "approved" },
    { serviceId: svcIds[17], customerId: custIds[3], specialistId: specIds[10], overall: "thumbs_up", qualityRating: 4, timingRating: 4, communicationRating: 5, text: "Реклама работает, лиды идут. Хороший специалист.", status: "approved" },
    { serviceId: svcIds[18], customerId: custIds[1], specialistId: specIds[11], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Сын набрал 92 балла на ЕГЭ! Огромное спасибо!", status: "approved" },
    { serviceId: svcIds[20], customerId: custIds[2], specialistId: specIds[13], overall: "thumbs_up", qualityRating: 4, timingRating: 4, communicationRating: 5, text: "Хороший SMM-щик, подписчики растут, вовлечённость тоже.", status: "approved" },
    { serviceId: svcIds[21], customerId: custIds[3], specialistId: specIds[14], overall: "thumbs_up", qualityRating: 5, timingRating: 4, communicationRating: 5, text: "Приложение работает отлично, пользователи довольны.", status: "approved" },
  ];

  await db.insert(reviews).values(reviewData);
  console.log("Reviews seeded:", reviewData.length);

  // ─── Portfolios ───────────────────────────────────────────────────────
  const portfolioData = [
    { userId: specIds[0], serviceId: svcIds[0], description: "Фирменный стиль для сети кофеен", status: "approved" },
    { userId: specIds[0], serviceId: svcIds[0], description: "Ребрендинг IT-компании", status: "approved" },
    { userId: specIds[0], serviceId: svcIds[1], description: "Упаковка косметической линейки", status: "approved" },
    { userId: specIds[1], serviceId: svcIds[2], description: "Дизайн фитнес-приложения", status: "approved" },
    { userId: specIds[1], serviceId: svcIds[2], description: "UI для банковского приложения", status: "approved" },
    { userId: specIds[2], serviceId: svcIds[4], description: "Telegram-бот для доставки еды", status: "approved" },
    { userId: specIds[2], serviceId: svcIds[5], description: "CRM-система на React", status: "approved" },
    { userId: specIds[3], serviceId: svcIds[6], description: "Свадебный макияж", status: "approved" },
    { userId: specIds[3], serviceId: svcIds[6], description: "Фотосессия для журнала", status: "approved" },
    { userId: specIds[6], serviceId: svcIds[12], description: "Предметная съёмка для маркетплейса", status: "approved" },
    { userId: specIds[8], serviceId: svcIds[14], description: "Ремонт 3-комнатной квартиры", status: "approved" },
    { userId: specIds[9], serviceId: svcIds[15], description: "Юридическое сопровождение сделки", status: "approved" },
  ];

  await db.insert(portfolios).values(portfolioData);
  console.log("Portfolios seeded:", portfolioData.length);

  // ─── External Links ───────────────────────────────────────────────────
  await db.insert(externalLinks).values([
    { userId: specIds[0], linkType: "behance", url: "https://behance.net/morozov_design", title: "Behance", isVisible: true, status: "approved" },
    { userId: specIds[0], linkType: "dprofile", url: "https://dprofile.ru/morozov", title: "Dprofile", isVisible: true, status: "approved" },
    { userId: specIds[1], linkType: "behance", url: "https://behance.net/sokolova_ui", title: "Behance", isVisible: true, status: "approved" },
    { userId: specIds[2], linkType: "github", url: "https://github.com/volkovdev", title: "GitHub", isVisible: true, status: "approved" },
    { userId: specIds[6], linkType: "website", url: "https://lebedev.photo", title: "Сайт-портфолио", isVisible: true, status: "approved" },
  ]);
  console.log("External links seeded");

  // ─── Contacts ─────────────────────────────────────────────────────────
  await db.insert(contacts).values([
    { serviceId: svcIds[0], customerId: custIds[0], specialistId: specIds[0], status: "completed", confirmedByCustomer: true, confirmedBySpecialist: true, dealAmount: "45000.00" },
    { serviceId: svcIds[2], customerId: custIds[3], specialistId: specIds[1], status: "completed", confirmedByCustomer: true, confirmedBySpecialist: true, dealAmount: "80000.00" },
    { serviceId: svcIds[6], customerId: custIds[2], specialistId: specIds[3], status: "completed", confirmedByCustomer: true, confirmedBySpecialist: true, dealAmount: "5000.00" },
    { serviceId: svcIds[10], customerId: custIds[2], specialistId: specIds[5], status: "deal_started", dealAmount: "12000.00" },
    { serviceId: svcIds[14], customerId: custIds[0], specialistId: specIds[8], status: "completed", confirmedByCustomer: true, confirmedBySpecialist: true, dealAmount: "250000.00" },
    { serviceId: svcIds[18], customerId: custIds[1], specialistId: specIds[11], status: "chat" },
    { serviceId: svcIds[21], customerId: custIds[3], specialistId: specIds[14], status: "completed", confirmedByCustomer: true, confirmedBySpecialist: true, dealAmount: "120000.00" },
  ]);
  console.log("Contacts seeded");

  // ─── Subscriptions ────────────────────────────────────────────────────
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  await db.insert(subscriptions).values([
    { userId: specIds[0], plan: "top", status: "active", validUntil: threeMonths, autoRenew: true },
    { userId: specIds[1], plan: "top", status: "active", validUntil: nextMonth, autoRenew: true },
    { userId: specIds[2], plan: "master", status: "active", validUntil: nextMonth, autoRenew: true },
    { userId: specIds[3], plan: "top", status: "active", validUntil: threeMonths, autoRenew: true },
    { userId: specIds[4], plan: "master", status: "active", validUntil: nextMonth, autoRenew: false },
    { userId: specIds[5], plan: "top", status: "active", validUntil: threeMonths, autoRenew: true },
    { userId: specIds[6], plan: "master", status: "active", validUntil: nextMonth, autoRenew: true },
    { userId: specIds[7], plan: "expert", status: "active", validUntil: nextMonth, autoRenew: true },
    { userId: specIds[8], plan: "top", status: "active", validUntil: threeMonths, autoRenew: true },
    { userId: specIds[9], plan: "expert", status: "active", validUntil: nextMonth, autoRenew: true },
  ]);
  console.log("Subscriptions seeded");

  // ─── Tenders ──────────────────────────────────────────────────────────
  await db.insert(tenders).values([
    { customerId: custIds[0], title: "Дизайн фирменного стиля для строительной компании", description: "Нужен полный комплект фирменного стиля: логотип, цвета, шрифты, носители. Бюджет до 80 000 ₽.", categoryId: cats[0], budget: "80000.00", deadline: "2 недели", status: "active", priority: "priority", views: 45, responses: 3 },
    { customerId: custIds[1], title: "Разработка сайта для сети кофеен", description: "Нужен современный сайт с меню, онлайн-заказом и интеграцией доставки. На WordPress или кастом.", categoryId: cats[1], budget: "120000.00", deadline: "1 месяц", status: "active", priority: "urgent", views: 67, responses: 5 },
    { customerId: custIds[2], title: "SEO-продвижение IT-компании (6 мес)", description: "Комплексное SEO: аудит, внутренняя оптимизация, ссылочное, контент. Цель — топ-10 по 20 запросам.", categoryId: cats[6], budget: "180000.00", deadline: "6 месяцев", status: "active", views: 34, responses: 2 },
    { customerId: custIds[3], title: "Мобильное приложение для службы доставки", description: "Приложение для курьеров и клиентов. Трекинг, уведомления, оплата. iOS + Android.", categoryId: cats[1], budget: "300000.00", deadline: "2 месяца", status: "active", views: 89, responses: 7 },
    { customerId: custIds[0], title: "Фотосъёмка строительных объектов", description: "Профессиональная фотосъёмка 5 строительных объектов для портфолио и сайта.", categoryId: cats[8], budget: "50000.00", deadline: "1 неделя", status: "active", views: 23, responses: 1 },
    { customerId: custIds[2], title: "Копирайтинг для Landing Page", description: "Продающие тексты для 5 landing pages. Ниша — IT-услуги для бизнеса.", categoryId: cats[7], budget: "25000.00", deadline: "5 дней", status: "active", views: 41, responses: 4 },
  ]);
  console.log("Tenders seeded");

  // ─── Topics ───────────────────────────────────────────────────────────
  await db.insert(topics).values([
    { groupId: -1001234567890, topicId: 1, topicSlug: "guide", topicName: "📌 ПРАВИЛА И ВХОД", botActions: JSON.stringify(["pin"]) },
    { groupId: -1001234567890, topicId: 2, topicSlug: "tenders", topicName: "📋 ТЕНДЕРЫ", botActions: JSON.stringify(["post"]) },
    { groupId: -1001234567890, topicId: 3, topicSlug: "deal_logs", topicName: "🔒 ЛОГИ СДЕЛОК", botActions: JSON.stringify(["post"]) },
    { groupId: -1001234567890, topicId: 4, topicSlug: "reputation", topicName: "⭐ РЕПУТАЦИЯ", botActions: JSON.stringify(["post"]) },
    { groupId: -1001234567890, topicId: 5, topicSlug: "general", topicName: "💬 ОБЩИЙ ЧАТ", botActions: JSON.stringify([]) },
    { groupId: -1001234567890, topicId: 6, topicSlug: "knowledge", topicName: "📚 БАЗА ЗНАНИЙ", botActions: JSON.stringify(["pin"]) },
    { groupId: -1001234567890, topicId: 7, topicSlug: "mentorship", topicName: "🎓 НАСТАВНИЧЕСТВО", botActions: JSON.stringify([]) },
    { groupId: -1001234567890, topicId: 8, topicSlug: "arbitration", topicName: "🛡 АРБИТРАЖ", botActions: JSON.stringify([]) },
  ]);
  console.log("Topics seeded");

  // ─── Auto Post Templates ──────────────────────────────────────────────
  await db.insert(autoPostTemplates).values([
    { trigger: "service_approved", topicSlug: "reputation", templateText: "🔥 {Имя} добавил(а) услугу: {название} • от {цена} ₽", buttonText: "👀 Смотреть", buttonType: "web_app", buttonUrl: "/services/{id}" },
    { trigger: "review_approved", topicSlug: "reputation", templateText: "⭐ Новый отзыв: {специалист} • {услуга}", buttonText: "👍 Читать", buttonType: "web_app", buttonUrl: "/reviews/{id}" },
    { trigger: "status_changed", topicSlug: "general", templateText: "🎉 {Имя} теперь {статус}!", buttonText: "Посмотреть профиль", buttonType: "web_app", buttonUrl: "/specialists/{id}" },
  ]);
  console.log("Auto post templates seeded");

  // ─── Admin User ───────────────────────────────────────────────────────
  const [{ id: adminId }] = await db.insert(users).values({
    telegramId: 99999,
    firstName: "Анастасия",
    lastName: "Администратор",
    username: "omnifound_admin",
    role: "admin",
    country: "Россия",
    city: "Москва",
    bio: "Хозяйка Гильдии OmniFind",
    onboardingComplete: true,
  }).$returningId();

  await db.insert(specialistProfiles).values({
    userId: adminId,
    specialization: "Администратор Гильдии",
    status: "top",
    rating: "5.00",
  });
  console.log("Admin user seeded:", adminId);

  console.log("\n✅ Seeding complete!");
}

seed().catch(console.error);

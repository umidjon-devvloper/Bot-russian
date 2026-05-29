import { getDb } from "../api/queries/connection";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

async function seed() {
  const db = getDb();

  // Helper to get IDs after insert
  const insertUsers = async (data: typeof schema.users.$inferInsert[]) => {
    const result = await db.insert(schema.users).values(data).$returningId();
    return result.map((r, i) => ({ ...data[i], id: r.id }));
  };

  // Categories first (no FK dependencies)
  const catsResult = await db.insert(schema.categories).values([
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
  const catIds = catsResult.map(r => r.id);
  console.log("Categories:", catIds);

  // Specialists
  const specUsersData = [
    { telegramId: 10001, firstName: "Алексей", lastName: "Морозов", username: "morozov_design", country: "Россия", city: "Москва", bio: "Графический дизайнер с 8-летним опытом. Специализация — фирменный стиль и упаковка. Работал с Сбер, Яндекс, Тинькофф.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 85 },
    { telegramId: 10002, firstName: "Екатерина", lastName: "Соколова", username: "sokolova_ui", country: "Россия", city: "Санкт-Петербург", bio: "UI/UX дизайнер. Делаю интерфейсы, которые продают. 50+ проектов в портфолио.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 92 },
    { telegramId: 10003, firstName: "Дмитрий", lastName: "Волков", username: "volkov_dev", country: "Россия", city: "Казань", bio: "Fullstack разработчик. React, Node.js, PostgreSQL. Быстро, качественно, с гарантией.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 78 },
    { telegramId: 10004, firstName: "Анна", lastName: "Павлова", username: "pavlova_beauty", country: "Россия", city: "Москва", bio: "Визажист-бровист. Обучение у лучших мастеров Европы. Использую премиальную косметику.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 88 },
    { telegramId: 10005, firstName: "Максим", lastName: "Козлов", username: "kozlov_seo", country: "Беларусь", city: "Минск", bio: "SEO-специалист с 6-летним опытом. Вывел 30+ сайтов в топ-10. Гарантия результата.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 75 },
    { telegramId: 10006, firstName: "Ольга", lastName: "Новикова", username: "novikova_copy", country: "Россия", city: "Екатеринбург", bio: "Копирайтер, контент-стратег. Пишу тексты, которые продают. Сотрудничаю с крупными брендами.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 90 },
    { telegramId: 10007, firstName: "Иван", lastName: "Лебедев", username: "lebedev_photo", country: "Казахстан", city: "Алматы", bio: "Профессиональный фотограф. Свадьбы, портреты, реклама. Съёмка по всему СНГ.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 82 },
    { telegramId: 10008, firstName: "Мария", lastName: "Кузнецова", username: "kuznetsova_1c", country: "Россия", city: "Новосибирск", bio: "Программист 1С. Внедрение, доработка, сопровождение. Сертифицированный специалист.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 70 },
    { telegramId: 10009, firstName: "Артём", lastName: "Семёнов", username: "seminov_repair", country: "Россия", city: "Самара", bio: "Ремонт квартир под ключ. 12 лет опыта. Своя бригада. Гарантия 3 года на все работы.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 95 },
    { telegramId: 10010, firstName: "Татьяна", lastName: "Егорова", username: "egorova_legal", country: "Россия", city: "Москва", bio: "Юрист по гражданскому и налоговому праву. 15 лет практики. Решаю сложные кейсы.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 87 },
    { telegramId: 10011, firstName: "Сергей", lastName: "Попов", username: "popov_target", country: "Россия", city: "Сочи", bio: "Таргетолог. Настройка рекламы VK, Яндекс, Telegram. ROI от 300%.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 80 },
    { telegramId: 10012, firstName: "Наталья", lastName: "Васильева", username: "vasilieva_tutor", country: "Россия", city: "Краснодар", bio: "Репетитор по математике и физике. Подготовка к ЕГЭ и ОГЭ. 90% учеников на 80+ баллов.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 76 },
    { telegramId: 10013, firstName: "Павел", lastName: "Петров", username: "petrov_motion", country: "Узбекистан", city: "Ташкент", bio: "Motion-дизайнер. Анимация логотипов, рекламные ролики, презентации. After Effects, Cinema 4D.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 84 },
    { telegramId: 10014, firstName: "Елена", lastName: "Смирнова", username: "smirnova_smm", country: "Россия", city: "Уфа", bio: "SMM-менеджер. Ведение соцсетей, стратегии, контент-планы. Рост подписчиков от 0 до 50K.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 79 },
    { telegramId: 10015, firstName: "Андрей", lastName: "Макаров", username: "makarov_mobile", country: "Россия", city: "Владивосток", bio: "Разработка мобильных приложений iOS и Android. Flutter, React Native. 20+ приложений в сторах.", role: "specialist" as const, selectedRole: "specialist", onboardingComplete: true, profileCompletion: 91 },
  ];

  const specUsers = [] as Array<typeof specUsersData[0] & { id: number }>;
  for (const u of specUsersData) {
    const [{ id }] = await db.insert(schema.users).values(u).$returningId();
    specUsers.push({ ...u, id });
  }
  const specIds = specUsers.map(u => u.id);
  console.log("Specialists:", specIds);

  // Customer users
  const custUsersData = [
    { telegramId: 20001, firstName: "ООО", lastName: "СтройГранд", username: "stroygrand", country: "Россия", city: "Москва", bio: "Крупная строительная компания. Ищем надёжных подрядчиков.", role: "customer" as const, selectedRole: "customer", onboardingComplete: true },
    { telegramId: 20002, firstName: "Алексей", lastName: "Воронов", username: "voronov_al", country: "Россия", city: "Санкт-Петербург", bio: "Владелец сети кофеен. Нужен постоянный дизайнер.", role: "customer" as const, selectedRole: "customer", onboardingComplete: true },
    { telegramId: 20003, firstName: "Марина", lastName: "Козлова", username: "kozlova_m", country: "Россия", city: "Екатеринбург", bio: "Маркетинг-директор IT-компании. Ищу копирайтера и SMM-щика.", role: "customer" as const, selectedRole: "customer", onboardingComplete: true },
    { telegramId: 20004, firstName: "ИП", lastName: "Григорьев", username: "grigoriev_ip", country: "Россия", city: "Казань", bio: "Предприниматель. Нужен сайт и продвижение.", role: "customer" as const, selectedRole: "customer", onboardingComplete: true },
  ];

  const custUsers = [] as Array<typeof custUsersData[0] & { id: number }>;
  for (const u of custUsersData) {
    const [{ id }] = await db.insert(schema.users).values(u).$returningId();
    custUsers.push({ ...u, id });
  }
  const custIds = custUsers.map(u => u.id);
  console.log("Customers:", custIds);

  // Admin user
  const [{ id: adminId }] = await db.insert(schema.users).values({
    telegramId: 99999, firstName: "Анастасия", lastName: "Гильдмейстер",
    username: "omnifound_admin", country: "Россия", city: "Москва",
    bio: "Хозяйка Гильдии OmniFind", role: "admin", selectedRole: "specialist", onboardingComplete: true,
  }).$returningId();
  console.log("Admin:", adminId);

  // Specialist profiles
  const profiles = [
    { userId: specIds[0], specialization: "Графический дизайн, фирменный стиль", status: "top" as const, rating: "4.92", totalContacts: 127, totalReviews: 48, totalDeals: 56, avgQuality: "5.0", avgTiming: "4.8", avgCommunication: "5.0" },
    { userId: specIds[1], specialization: "UI/UX дизайн, прототипирование", status: "expert" as const, rating: "4.85", totalContacts: 89, totalReviews: 34, totalDeals: 38, avgQuality: "4.9", avgTiming: "4.7", avgCommunication: "4.9" },
    { userId: specIds[2], specialization: "Fullstack разработка", status: "master" as const, rating: "4.78", totalContacts: 65, totalReviews: 22, totalDeals: 25, avgQuality: "4.8", avgTiming: "4.6", avgCommunication: "4.9" },
    { userId: specIds[3], specialization: "Визаж, брови, макияж", status: "expert" as const, rating: "4.95", totalContacts: 156, totalReviews: 67, totalDeals: 72, avgQuality: "5.0", avgTiming: "4.9", avgCommunication: "4.9" },
    { userId: specIds[4], specialization: "SEO-продвижение, аудит", status: "master" as const, rating: "4.65", totalContacts: 43, totalReviews: 18, totalDeals: 20, avgQuality: "4.7", avgTiming: "4.5", avgCommunication: "4.6" },
    { userId: specIds[5], specialization: "Копирайтинг, контент-стратегия", status: "top" as const, rating: "4.88", totalContacts: 98, totalReviews: 41, totalDeals: 45, avgQuality: "4.9", avgTiming: "4.8", avgCommunication: "4.9" },
    { userId: specIds[6], specialization: "Фотосъёмка, видеосъёмка", status: "master" as const, rating: "4.72", totalContacts: 72, totalReviews: 28, totalDeals: 30, avgQuality: "4.8", avgTiming: "4.6", avgCommunication: "4.7" },
    { userId: specIds[7], specialization: "1С программирование, внедрение", status: "expert" as const, rating: "4.81", totalContacts: 54, totalReviews: 19, totalDeals: 22, avgQuality: "4.9", avgTiming: "4.5", avgCommunication: "5.0" },
    { userId: specIds[8], specialization: "Ремонт квартир под ключ", status: "top" as const, rating: "4.90", totalContacts: 134, totalReviews: 52, totalDeals: 58, avgQuality: "4.9", avgTiming: "4.8", avgCommunication: "5.0" },
    { userId: specIds[9], specialization: "Юридические консультации", status: "expert" as const, rating: "4.87", totalContacts: 76, totalReviews: 31, totalDeals: 35, avgQuality: "5.0", avgTiming: "4.7", avgCommunication: "4.9" },
    { userId: specIds[10], specialization: "Таргетированная реклама", status: "master" as const, rating: "4.70", totalContacts: 51, totalReviews: 20, totalDeals: 23, avgQuality: "4.7", avgTiming: "4.6", avgCommunication: "4.8" },
    { userId: specIds[11], specialization: "Подготовка к ЕГЭ, математика", status: "master" as const, rating: "4.75", totalContacts: 38, totalReviews: 15, totalDeals: 18, avgQuality: "4.8", avgTiming: "4.7", avgCommunication: "4.7" },
    { userId: specIds[12], specialization: "Motion-дизайн, анимация", status: "expert" as const, rating: "4.83", totalContacts: 62, totalReviews: 24, totalDeals: 27, avgQuality: "4.9", avgTiming: "4.7", avgCommunication: "4.9" },
    { userId: specIds[13], specialization: "SMM, ведение соцсетей", status: "master" as const, rating: "4.68", totalContacts: 47, totalReviews: 19, totalDeals: 21, avgQuality: "4.7", avgTiming: "4.5", avgCommunication: "4.8" },
    { userId: specIds[14], specialization: "Мобильная разработка", status: "expert" as const, rating: "4.79", totalContacts: 58, totalReviews: 23, totalDeals: 26, avgQuality: "4.8", avgTiming: "4.7", avgCommunication: "4.9" },
    { userId: adminId, specialization: "Администратор Гильдии", status: "top" as const, rating: "5.00" },
  ];
  await db.insert(schema.specialistProfiles).values(profiles);
  console.log("Profiles seeded:", profiles.length);

  // Customer profiles
  await db.insert(schema.customerProfiles).values([
    { userId: custIds[0], companyName: "ООО СтройГранд", innOgrn: "7701234567", status: "company", totalPublications: 5, totalHires: 12 },
    { userId: custIds[1], status: "verified", totalPublications: 3, totalHires: 8 },
    { userId: custIds[2], companyName: "IT-Pro", status: "company", totalPublications: 8, totalHires: 15 },
    { userId: custIds[3], status: "verified", totalPublications: 2, totalHires: 4 },
  ]);
  console.log("Customer profiles seeded");

  // Services
  const svcsData = [
    { userId: specIds[0], categoryId: catIds[0], title: "Фирменный стиль для бизнеса", description: "Разработка логотипа, цветовой палитры, типографики, носителей фирменного стиля.", whatIncluded: JSON.stringify(["Логотип","Цветовая палитра","Шрифты","Визитки","Бланки","Руководство"]), deadlineValue: 14, deadlineUnit: "days", price: "45000.00", tags: JSON.stringify(["фирменный стиль","логотип"]), status: "active" as const, avgRating: "4.9", views: 234, contactClicks: 45 },
    { userId: specIds[0], categoryId: catIds[0], title: "Дизайн упаковки продукта", description: "Создание уникальной упаковки, которая выделяет продукт на полке.", whatIncluded: JSON.stringify(["Исследование","3 концепции","Доработка","Макеты"]), deadlineValue: 10, deadlineUnit: "days", price: "35000.00", tags: JSON.stringify(["упаковка","дизайн"]), status: "active" as const, avgRating: "5.0", views: 189, contactClicks: 32 },
    { userId: specIds[1], categoryId: catIds[0], title: "Дизайн мобильного приложения", description: "UI/UX дизайн iOS и Android приложений. От прототипов до финальных макетов.", whatIncluded: JSON.stringify(["Прототип","UI-kit","Экраны","Анимации"]), deadlineValue: 21, deadlineUnit: "days", price: "80000.00", tags: JSON.stringify(["UI","UX","мобильное"]), status: "active" as const, avgRating: "4.8", views: 312, contactClicks: 67 },
    { userId: specIds[1], categoryId: catIds[0], title: "Дизайн Landing Page", description: "Продающий дизайн одностраничного сайта.", whatIncluded: JSON.stringify(["Анализ ЦА","Структура","Дизайн десктоп","Мобильный","UI-kit"]), deadlineValue: 7, deadlineUnit: "days", price: "30000.00", tags: JSON.stringify(["лендинг","веб-дизайн"]), status: "active" as const, avgRating: "4.9", views: 278, contactClicks: 51 },
    { userId: specIds[2], categoryId: catIds[1], title: "Разработка Telegram-бота", description: "Создание ботов любой сложности на Python.", whatIncluded: JSON.stringify(["ТЗ","Разработка","Тестирование","Деплой","Поддержка"]), deadlineValue: 5, deadlineUnit: "days", price: "25000.00", tags: JSON.stringify(["Telegram","бот","Python"]), status: "active" as const, avgRating: "4.7", views: 156, contactClicks: 28 },
    { userId: specIds[2], categoryId: catIds[1], title: "Разработка веб-приложения на React", description: "Современные SPA на React + TypeScript + Tailwind.", whatIncluded: JSON.stringify(["Архитектура","Разработка","Интеграция API","Тестирование"]), deadlineValue: 14, deadlineUnit: "days", price: "60000.00", tags: JSON.stringify(["React","TypeScript"]), status: "active" as const, avgRating: "4.8", views: 198, contactClicks: 43 },
    { userId: specIds[3], categoryId: catIds[4], title: "Макияж для фотосессии", description: "Профессиональный макияж любой сложности.", whatIncluded: JSON.stringify(["Консультация","Подготовка","Макияж","Фиксация"]), deadlineValue: 1, deadlineUnit: "days", price: "5000.00", tags: JSON.stringify(["макияж","визаж"]), status: "active" as const, avgRating: "5.0", views: 445, contactClicks: 89 },
    { userId: specIds[3], categoryId: catIds[4], title: "Оформление бровей", description: "Архитектура бровей, окрашивание, ламинирование.", whatIncluded: JSON.stringify(["Коррекция","Окрашивание","Ламинирование"]), deadlineValue: 1, deadlineUnit: "days", price: "2500.00", tags: JSON.stringify(["брови","ламинирование"]), status: "active" as const, avgRating: "4.9", views: 312, contactClicks: 56 },
    { userId: specIds[4], categoryId: catIds[6], title: "SEO-аудит сайта", description: "Полный технический и контентный аудит.", whatIncluded: JSON.stringify(["Тех. аудит","Контентный анализ","Анализ конкурентов","Чек-лист"]), deadlineValue: 3, deadlineUnit: "days", price: "15000.00", tags: JSON.stringify(["SEO","аудит"]), status: "active" as const, avgRating: "4.6", views: 123, contactClicks: 21 },
    { userId: specIds[4], categoryId: catIds[6], title: "SEO-продвижение (3 мес)", description: "Комплексное продвижение сайта.", whatIncluded: JSON.stringify(["Анализ","Оптимизация","Ссылки","Контент","Отчёты"]), deadlineValue: 90, deadlineUnit: "days", price: "45000.00", tags: JSON.stringify(["SEO","продвижение"]), status: "active" as const, avgRating: "4.7", views: 98, contactClicks: 18 },
    { userId: specIds[5], categoryId: catIds[7], title: "Копирайтинг для сайта", description: "Продающие тексты для Landing Page.", whatIncluded: JSON.stringify(["Анализ ЦА","Заголовки","Тексты","CTA"]), deadlineValue: 5, deadlineUnit: "days", price: "12000.00", tags: JSON.stringify(["копирайтинг","тексты"]), status: "active" as const, avgRating: "4.9", views: 167, contactClicks: 34 },
    { userId: specIds[5], categoryId: catIds[7], title: "Сценарий для видеоролика", description: "Сценарии для рекламных роликов, reels, TikTok.", whatIncluded: JSON.stringify(["Исследование","Хуки","Сценарий","Советы"]), deadlineValue: 3, deadlineUnit: "days", price: "8000.00", tags: JSON.stringify(["сценарий","видео","TikTok"]), status: "active" as const, avgRating: "4.8", views: 134, contactClicks: 27 },
    { userId: specIds[6], categoryId: catIds[8], title: "Профессиональная фотосессия", description: "Индивидуальная, семейная, предметная фотосъёмка.", whatIncluded: JSON.stringify(["Консультация","Съёмка 2ч","Обработка 30 фото"]), deadlineValue: 3, deadlineUnit: "days", price: "15000.00", tags: JSON.stringify(["фотосессия","портрет"]), status: "active" as const, avgRating: "4.8", views: 289, contactClicks: 52 },
    { userId: specIds[7], categoryId: catIds[2], title: "Внедрение 1С:Управление торговлей", description: "Настройка и внедрение 1С под ваш бизнес.", whatIncluded: JSON.stringify(["Аудит","Настройка","Загрузка данных","Обучение"]), deadlineValue: 14, deadlineUnit: "days", price: "55000.00", tags: JSON.stringify(["1С","внедрение"]), status: "active" as const, avgRating: "4.8", views: 87, contactClicks: 15 },
    { userId: specIds[8], categoryId: catIds[3], title: "Ремонт квартиры под ключ", description: "Полный ремонт от демонтажа до финальной отделки.", whatIncluded: JSON.stringify(["Дизайн-проект","Демонтаж","Черновые","Чистовая"]), deadlineValue: 60, deadlineUnit: "days", price: "250000.00", tags: JSON.stringify(["ремонт","квартира"]), status: "active" as const, avgRating: "4.9", views: 534, contactClicks: 112 },
    { userId: specIds[9], categoryId: catIds[9], title: "Консультация юриста", description: "Устная или письменная консультация по праву.", whatIncluded: JSON.stringify(["Анализ","Правовая оценка","Рекомендации"]), deadlineValue: 1, deadlineUnit: "days", price: "5000.00", tags: JSON.stringify(["юрист","консультация"]), status: "active" as const, avgRating: "4.9", views: 198, contactClicks: 38 },
    { userId: specIds[10], categoryId: catIds[6], title: "Настройка VK Рекламы", description: "Запуск и ведение рекламных кампаний VK.", whatIncluded: JSON.stringify(["Анализ ЦА","Объявления","A/B тест","Отчёт"]), deadlineValue: 3, deadlineUnit: "days", price: "12000.00", tags: JSON.stringify(["VK","таргет"]), status: "active" as const, avgRating: "4.7", views: 145, contactClicks: 29 },
    { userId: specIds[11], categoryId: catIds[5], title: "Подготовка к ЕГЭ по математике", description: "Индивидуальные занятия. Профильный уровень.", whatIncluded: JSON.stringify(["Диагностика","План","20 уроков","Пробники"]), deadlineValue: 90, deadlineUnit: "days", price: "30000.00", tags: JSON.stringify(["ЕГЭ","математика"]), status: "active" as const, avgRating: "4.8", views: 112, contactClicks: 22 },
    { userId: specIds[12], categoryId: catIds[0], title: "Анимация логотипа", description: "Создание динамичной анимации вашего логотипа.", whatIncluded: JSON.stringify(["3 концепции","Анимация","Звук","Форматы"]), deadlineValue: 5, deadlineUnit: "days", price: "18000.00", tags: JSON.stringify(["анимация","логотип","motion"]), status: "active" as const, avgRating: "4.8", views: 156, contactClicks: 31 },
    { userId: specIds[13], categoryId: catIds[6], title: "Ведение Instagram (1 мес)", description: "Полное ведение профиля.", whatIncluded: JSON.stringify(["Контент-план","15 постов","30 сторис","3 reels"]), deadlineValue: 30, deadlineUnit: "days", price: "25000.00", tags: JSON.stringify(["Instagram","SMM"]), status: "active" as const, avgRating: "4.7", views: 178, contactClicks: 35 },
    { userId: specIds[14], categoryId: catIds[1], title: "Разработка мобильного приложения Flutter", description: "Кроссплатформенное приложение на Flutter.", whatIncluded: JSON.stringify(["Проектирование","Разработка","Тестирование","Публикация"]), deadlineValue: 30, deadlineUnit: "days", price: "120000.00", tags: JSON.stringify(["Flutter","iOS","Android"]), status: "active" as const, avgRating: "4.8", views: 267, contactClicks: 58 },
    { userId: specIds[0], categoryId: catIds[0], title: "Презентация компании", description: "Дизайн презентации для инвесторов.", whatIncluded: JSON.stringify(["Структура","Дизайн слайдов","Инфографика","Анимации"]), deadlineValue: 7, deadlineUnit: "days", price: "20000.00", tags: JSON.stringify(["презентация","дизайн"]), status: "active" as const, avgRating: "4.8", views: 98, contactClicks: 18 },
    { userId: specIds[3], categoryId: catIds[4], title: "Ламинирование ресниц", description: "Долговременная укладка и ламинирование ресниц.", whatIncluded: JSON.stringify(["Очищение","Ламинирование","Окрашивание"]), deadlineValue: 1, deadlineUnit: "days", price: "3000.00", tags: JSON.stringify(["ресницы","ламинирование"]), status: "active" as const, avgRating: "5.0", views: 234, contactClicks: 47 },
    { userId: specIds[9], categoryId: catIds[9], title: "Договорная работа", description: "Составление, проверка, анализ договоров.", whatIncluded: JSON.stringify(["Анализ","Правки","Замечания"]), deadlineValue: 2, deadlineUnit: "days", price: "8000.00", tags: JSON.stringify(["договор","юрист"]), status: "active" as const, avgRating: "4.9", views: 156, contactClicks: 29 },
  ];

  const svcResults = [] as Array<{ id: number }>;
  for (const s of svcsData) {
    const [{ id }] = await db.insert(schema.services).values(s).$returningId();
    svcResults.push({ id });
  }
  const svcIds = svcResults.map(r => r.id);
  console.log("Services seeded:", svcIds.length);

  // Reviews
  await db.insert(schema.reviews).values([
    { serviceId: svcIds[0], customerId: custIds[0], specialistId: specIds[0], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Отличная работа! Логотип превзошёл ожидания.", status: "approved" },
    { serviceId: svcIds[0], customerId: custIds[1], specialistId: specIds[0], overall: "thumbs_up", qualityRating: 5, timingRating: 4, communicationRating: 5, text: "Профессал высшего класса. В срок.", status: "approved" },
    { serviceId: svcIds[2], customerId: custIds[3], specialistId: specIds[1], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 4, text: "Дизайн приложения крутой!", status: "approved" },
    { serviceId: svcIds[6], customerId: custIds[2], specialistId: specIds[3], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Лучший визажист! Макияж держался весь день.", status: "approved" },
    { serviceId: svcIds[6], customerId: custIds[1], specialistId: specIds[3], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Анна — волшебница! Уникальный образ.", status: "approved" },
    { serviceId: svcIds[9], customerId: custIds[3], specialistId: specIds[4], overall: "thumbs_up", qualityRating: 4, timingRating: 4, communicationRating: 5, text: "Трафик вырос на 40%!", status: "approved" },
    { serviceId: svcIds[10], customerId: custIds[2], specialistId: specIds[5], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Конверсия выросла в 2 раза!", status: "approved" },
    { serviceId: svcIds[12], customerId: custIds[1], specialistId: specIds[6], overall: "thumbs_up", qualityRating: 5, timingRating: 4, communicationRating: 5, text: "Потрясающие фото!", status: "approved" },
    { serviceId: svcIds[14], customerId: custIds[0], specialistId: specIds[8], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "Ремонт идеально. В срок!", status: "approved" },
    { serviceId: svcIds[15], customerId: custIds[2], specialistId: specIds[9], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 4, text: "Грамотная консультация.", status: "approved" },
    { serviceId: svcIds[17], customerId: custIds[3], specialistId: specIds[10], overall: "thumbs_up", qualityRating: 4, timingRating: 4, communicationRating: 5, text: "Лиды идут!", status: "approved" },
    { serviceId: svcIds[18], customerId: custIds[1], specialistId: specIds[11], overall: "thumbs_up", qualityRating: 5, timingRating: 5, communicationRating: 5, text: "92 балла на ЕГЭ! Спасибо!", status: "approved" },
    { serviceId: svcIds[20], customerId: custIds[2], specialistId: specIds[13], overall: "thumbs_up", qualityRating: 4, timingRating: 4, communicationRating: 5, text: "Подписчики растут.", status: "approved" },
    { serviceId: svcIds[21], customerId: custIds[3], specialistId: specIds[14], overall: "thumbs_up", qualityRating: 5, timingRating: 4, communicationRating: 5, text: "Приложение работает отлично.", status: "approved" },
  ]);
  console.log("Reviews seeded");

  // Contacts
  await db.insert(schema.contacts).values([
    { serviceId: svcIds[0], customerId: custIds[0], specialistId: specIds[0], status: "completed", confirmedByCustomer: true, confirmedBySpecialist: true, dealAmount: "45000.00" },
    { serviceId: svcIds[2], customerId: custIds[3], specialistId: specIds[1], status: "completed", confirmedByCustomer: true, confirmedBySpecialist: true, dealAmount: "80000.00" },
    { serviceId: svcIds[6], customerId: custIds[2], specialistId: specIds[3], status: "completed", confirmedByCustomer: true, confirmedBySpecialist: true, dealAmount: "5000.00" },
    { serviceId: svcIds[10], customerId: custIds[2], specialistId: specIds[5], status: "deal_started", confirmedByCustomer: false, confirmedBySpecialist: false, dealAmount: "12000.00" },
    { serviceId: svcIds[14], customerId: custIds[0], specialistId: specIds[8], status: "completed", confirmedByCustomer: true, confirmedBySpecialist: true, dealAmount: "250000.00" },
    { serviceId: svcIds[18], customerId: custIds[1], specialistId: specIds[11], status: "chat" },
    { serviceId: svcIds[21], customerId: custIds[3], specialistId: specIds[14], status: "completed", confirmedByCustomer: true, confirmedBySpecialist: true, dealAmount: "120000.00" },
  ]);
  console.log("Contacts seeded");

  // Subscriptions
  await db.insert(schema.subscriptions).values([
    { userId: specIds[0], plan: "top", status: "active", autoRenew: true },
    { userId: specIds[1], plan: "top", status: "active", autoRenew: true },
    { userId: specIds[2], plan: "master", status: "active", autoRenew: true },
    { userId: specIds[3], plan: "top", status: "active", autoRenew: true },
    { userId: specIds[4], plan: "master", status: "active", autoRenew: false },
    { userId: specIds[5], plan: "top", status: "active", autoRenew: true },
    { userId: specIds[6], plan: "master", status: "active", autoRenew: true },
    { userId: specIds[7], plan: "expert", status: "active", autoRenew: true },
    { userId: specIds[8], plan: "top", status: "active", autoRenew: true },
    { userId: specIds[9], plan: "expert", status: "active", autoRenew: true },
  ]);
  console.log("Subscriptions seeded");

  // Tenders
  await db.insert(schema.tenders).values([
    { customerId: custIds[0], title: "Дизайн фирменного стиля для строительной компании", description: "Нужен полный комплект фирменного стиля.", categoryId: catIds[0], budget: "80000.00", deadline: "2 недели", status: "active", priority: "priority", views: 45, responses: 3 },
    { customerId: custIds[1], title: "Разработка сайта для сети кофеен", description: "Современный сайт с меню, онлайн-заказом.", categoryId: catIds[1], budget: "120000.00", deadline: "1 месяц", status: "active", priority: "urgent", views: 67, responses: 5 },
    { customerId: custIds[2], title: "SEO-продвижение IT-компании (6 мес)", description: "Цель — топ-10 по 20 запросам.", categoryId: catIds[6], budget: "180000.00", deadline: "6 месяцев", status: "active", priority: "normal", views: 34, responses: 2 },
    { customerId: custIds[3], title: "Мобильное приложение для службы доставки", description: "Приложение для курьеров и клиентов.", categoryId: catIds[1], budget: "300000.00", deadline: "2 месяца", status: "active", priority: "normal", views: 89, responses: 7 },
    { customerId: custIds[0], title: "Фотосъёмка строительных объектов", description: "Профессиональная фотосъёмка 5 объектов.", categoryId: catIds[8], budget: "50000.00", deadline: "1 неделя", status: "active", views: 23, responses: 1 },
    { customerId: custIds[2], title: "Копирайтинг для Landing Page", description: "Продающие тексты для 5 landing pages.", categoryId: catIds[7], budget: "25000.00", deadline: "5 дней", status: "active", views: 41, responses: 4 },
  ]);
  console.log("Tenders seeded");

  // Topics
  await db.insert(schema.topics).values([
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

  // External Links
  await db.insert(schema.externalLinks).values([
    { userId: specIds[0], linkType: "behance", url: "https://behance.net/morozov_design", title: "Behance", isVisible: true, status: "approved" },
    { userId: specIds[0], linkType: "dprofile", url: "https://dprofile.ru/morozov", title: "Dprofile", isVisible: true, status: "approved" },
    { userId: specIds[1], linkType: "behance", url: "https://behance.net/sokolova_ui", title: "Behance", isVisible: true, status: "approved" },
    { userId: specIds[2], linkType: "github", url: "https://github.com/volkovdev", title: "GitHub", isVisible: true, status: "approved" },
    { userId: specIds[6], linkType: "website", url: "https://lebedev.photo", title: "Сайт-портфолио", isVisible: true, status: "approved" },
  ]);
  console.log("External links seeded");

  // Portfolios
  await db.insert(schema.portfolios).values([
    { userId: specIds[0], serviceId: svcIds[0], description: "Фирменный стиль для сети кофеен", status: "approved" },
    { userId: specIds[0], serviceId: svcIds[0], description: "Ребрендинг IT-компании", status: "approved" },
    { userId: specIds[1], serviceId: svcIds[2], description: "Дизайн фитнес-приложения", status: "approved" },
    { userId: specIds[3], serviceId: svcIds[6], description: "Свадебный макияж", status: "approved" },
    { userId: specIds[8], serviceId: svcIds[14], description: "Ремонт 3-комнатной квартиры", status: "approved" },
    { userId: specIds[9], serviceId: svcIds[15], description: "Юридическое сопровождение сделки", status: "approved" },
  ]);
  console.log("Portfolios seeded");

  // Verifications
  await db.insert(schema.verifications).values([
    { userId: specIds[0], level: "basic", status: "approved", notes: "Видеовизитка подтверждена" },
    { userId: specIds[0], level: "identity", status: "approved", notes: "Паспорт проверен" },
    { userId: specIds[1], level: "basic", status: "approved", notes: "Видеовизитка подтверждена" },
    { userId: specIds[2], level: "basic", status: "approved", notes: "Видеовизитка подтверждена" },
    { userId: specIds[3], level: "basic", status: "approved", notes: "Видеовизитка подтверждена" },
    { userId: specIds[3], level: "identity", status: "approved", notes: "Паспорт проверен" },
    { userId: specIds[4], level: "basic", status: "approved", notes: "Видеовизитка подтверждена" },
    { userId: specIds[5], level: "basic", status: "approved", notes: "Видеовизитка подтверждена" },
    { userId: specIds[6], level: "basic", status: "approved", notes: "Видеовизитка подтверждена" },
    { userId: specIds[8], level: "basic", status: "approved", notes: "Видеовизитка подтверждена" },
    { userId: specIds[8], level: "identity", status: "approved", notes: "Паспорт проверен" },
    { userId: specIds[9], level: "basic", status: "approved", notes: "Видеовизитка подтверждена" },
  ]);
  console.log("Verifications seeded");

  console.log("\n✅ Seeding complete!");
}

seed().catch(console.error);

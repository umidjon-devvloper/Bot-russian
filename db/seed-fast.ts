import { createConnection } from "mysql2/promise";

async function seed() {
  const conn = await createConnection(process.env.DATABASE_URL!);

  // Clear existing data
  await conn.execute("SET FOREIGN_KEY_CHECKS = 0");
  const tables = [
    "auto_post_templates","topics","tenders","subscriptions","escrow_transactions",
    "contacts","review_images","reviews","external_links","portfolio_images",
    "portfolios","service_images","services","categories","interviews",
    "verifications","channel_publications","moderation_log","notifications",
    "favorites","customer_profiles","specialist_profiles","users"
  ];
  for (const t of tables) {
    await conn.execute(`TRUNCATE TABLE \`${t}\``).catch(() => {});
  }
  await conn.execute("SET FOREIGN_KEY_CHECKS = 1");

  // Insert categories
  await conn.execute(
    `INSERT INTO categories (name, slug, emoji, sort_order) VALUES ?`,
    [[["Дизайн","design","🎨",1],["IT и разработка","it-dev","💻",2],["Бухгалтерия и финансы","accounting","📊",3],["Ремонт и стройка","repair","🛠",4],["Красота и здоровье","beauty","💅",5],["Репетиторы и обучение","tutoring","👩‍🏫",6],["Маркетинг и реклама","marketing","📈",7],["Копирайтинг","copywriting","✍️",8],["Фото и видео","photo-video","📸",9],["Юридические услуги","legal","⚖️",10]]]
  );

  // Insert users (specialists)
  const specData = [
    [10001,'Алексей','Морозов','morozov_design','Россия','Москва','Графический дизайнер с 8-летним опытом. Специализация — фирменный стиль и упаковка.','specialist','specialist',true,85],
    [10002,'Екатерина','Соколова','sokolova_ui','Россия','Санкт-Петербург','UI/UX дизайнер. Делаю интерфейсы, которые продают.','specialist','specialist',true,92],
    [10003,'Дмитрий','Волков','volkov_dev','Россия','Казань','Fullstack разработчик. React, Node.js, PostgreSQL.','specialist','specialist',true,78],
    [10004,'Анна','Павлова','pavlova_beauty','Россия','Москва','Визажист-бровист. Обучение у лучших мастеров Европы.','specialist','specialist',true,88],
    [10005,'Максим','Козлов','kozlov_seo','Беларусь','Минск','SEO-специалист с 6-летним опытом.','specialist','specialist',true,75],
    [10006,'Ольга','Новикова','novikova_copy','Россия','Екатеринбург','Копирайтер, контент-стратег.','specialist','specialist',true,90],
    [10007,'Иван','Лебедев','lebedev_photo','Казахстан','Алматы','Профессиональный фотограф.','specialist','specialist',true,82],
    [10008,'Мария','Кузнецова','kuznetsova_1c','Россия','Новосибирск','Программист 1С.','specialist','specialist',true,70],
    [10009,'Артём','Семёнов','seminov_repair','Россия','Самара','Ремонт квартир под ключ. 12 лет опыта.','specialist','specialist',true,95],
    [10010,'Татьяна','Егорова','egorova_legal','Россия','Москва','Юрист по гражданскому и налоговому праву.','specialist','specialist',true,87],
    [10011,'Сергей','Попов','popov_target','Россия','Сочи','Таргетолог. ROI от 300%.','specialist','specialist',true,80],
    [10012,'Наталья','Васильева','vasilieva_tutor','Россия','Краснодар','Репетитор по математике и физике.','specialist','specialist',true,76],
    [10013,'Павел','Петров','petrov_motion','Узбекистан','Ташкент','Motion-дизайнер.','specialist','specialist',true,84],
    [10014,'Елена','Смирнова','smirnova_smm','Россия','Уфа','SMM-менеджер.','specialist','specialist',true,79],
    [10015,'Андрей','Макаров','makarov_mobile','Россия','Владивосток','Разработка мобильных приложений.','specialist','specialist',true,91],
  ];
  await conn.execute(
    `INSERT INTO users (telegram_id, first_name, last_name, username, country, city, bio, role, selected_role, onboarding_complete, profile_completion) VALUES ?`,
    [specData]
  );

  // Insert customer users
  const custData = [
    [20001,'ООО','СтройГранд','stroygrand','Россия','Москва','Крупная строительная компания.','customer','customer',true,100],
    [20002,'Алексей','Воронов','voronov_al','Россия','Санкт-Петербург','Владелец сети кофеен.','customer','customer',true,100],
    [20003,'Марина','Козлова','kozlova_m','Россия','Екатеринбург','Маркетинг-директор.','customer','customer',true,100],
    [20004,'ИП','Григорьев','grigoriev_ip','Россия','Казань','Предприниматель.','customer','customer',true,100],
  ];
  await conn.execute(
    `INSERT INTO users (telegram_id, first_name, last_name, username, country, city, bio, role, selected_role, onboarding_complete, profile_completion) VALUES ?`,
    [custData]
  );

  // Insert admin
  await conn.execute(
    `INSERT INTO users (telegram_id, first_name, last_name, username, country, city, bio, role, selected_role, onboarding_complete, profile_completion) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [99999,'Анастасия','Гильдмейстер','omnifound_admin','Россия','Москва','Хозяйка Гильдии OmniFind','admin','specialist',true,100]
  );

  // Get IDs
  const [specRows] = await conn.execute("SELECT id FROM users WHERE role = 'specialist' ORDER BY id");
  const [custRows] = await conn.execute("SELECT id FROM users WHERE role = 'customer' ORDER BY id");
  const specIds = (specRows as any[]).map(r => r.id);
  const custIds = (custRows as any[]).map(r => r.id);
  const adminId = specIds[specIds.length - 1]; // last specialist is admin
  const realSpecIds = specIds.slice(0, -1); // all but last
  console.log("Spec IDs:", realSpecIds, "Cust IDs:", custIds, "Admin:", adminId);

  // Specialist profiles
  const profiles = [
    [realSpecIds[0],'Графический дизайн','top','4.92',127,48,56,'5.0','4.8','5.0'],
    [realSpecIds[1],'UI/UX дизайн','expert','4.85',89,34,38,'4.9','4.7','4.9'],
    [realSpecIds[2],'Fullstack разработка','master','4.78',65,22,25,'4.8','4.6','4.9'],
    [realSpecIds[3],'Визаж, брови, макияж','expert','4.95',156,67,72,'5.0','4.9','4.9'],
    [realSpecIds[4],'SEO-продвижение','master','4.65',43,18,20,'4.7','4.5','4.6'],
    [realSpecIds[5],'Копирайтинг','top','4.88',98,41,45,'4.9','4.8','4.9'],
    [realSpecIds[6],'Фотосъёмка','master','4.72',72,28,30,'4.8','4.6','4.7'],
    [realSpecIds[7],'1С программирование','expert','4.81',54,19,22,'4.9','4.5','5.0'],
    [realSpecIds[8],'Ремонт квартир','top','4.90',134,52,58,'4.9','4.8','5.0'],
    [realSpecIds[9],'Юридические консультации','expert','4.87',76,31,35,'5.0','4.7','4.9'],
    [realSpecIds[10],'Таргетированная реклама','master','4.70',51,20,23,'4.7','4.6','4.8'],
    [realSpecIds[11],'Подготовка к ЕГЭ','master','4.75',38,15,18,'4.8','4.7','4.7'],
    [realSpecIds[12],'Motion-дизайн','expert','4.83',62,24,27,'4.9','4.7','4.9'],
    [realSpecIds[13],'SMM','master','4.68',47,19,21,'4.7','4.5','4.8'],
    [realSpecIds[14],'Мобильная разработка','expert','4.79',58,23,26,'4.8','4.7','4.9'],
    [adminId,'Администратор Гильдии','top','5.00',0,0,0,'5.0','5.0','5.0'],
  ];
  await conn.execute(
    `INSERT INTO specialist_profiles (user_id, specialization, status, rating, total_contacts, total_reviews, total_deals, avg_quality, avg_timing, avg_communication) VALUES ?`,
    [profiles]
  );

  // Customer profiles
  await conn.execute(
    `INSERT INTO customer_profiles (user_id, company_name, inn_ogrn, status, total_publications, total_hires) VALUES ?`,
    [[[custIds[0],'ООО СтройГранд','7701234567','company',5,12],[custIds[1],null,null,'verified',3,8],[custIds[2],'IT-Pro',null,'company',8,15],[custIds[3],null,null,'verified',2,4]]]
  );

  // Get category IDs
  const [catRows] = await conn.execute("SELECT id FROM categories ORDER BY id");
  const catIds = (catRows as any[]).map(r => r.id);
  console.log("Cat IDs:", catIds);

  // Insert services
  const services = [
    [realSpecIds[0],catIds[0],'Фирменный стиль для бизнеса','Разработка логотипа, цветовой палитры, типографики.','["Логотип","Цвета","Шрифты"]',14,'days','45000.00','["стиль","логотип"]','active','4.9',234,45],
    [realSpecIds[0],catIds[0],'Дизайн упаковки продукта','Уникальная упаковка для продукта.','["3 концепции","Макеты"]',10,'days','35000.00','["упаковка"]','active','5.0',189,32],
    [realSpecIds[1],catIds[0],'Дизайн мобильного приложения','UI/UX дизайн iOS и Android.','["Прототип","UI-kit"]',21,'days','80000.00','["UI","UX"]','active','4.8',312,67],
    [realSpecIds[1],catIds[0],'Дизайн Landing Page','Продающий дизайн одностраничного сайта.','["Анализ","Структура"]',7,'days','30000.00','["лендинг"]','active','4.9',278,51],
    [realSpecIds[2],catIds[1],'Разработка Telegram-бота','Боты любой сложности на Python.','["ТЗ","Разработка"]',5,'days','25000.00','["бот","Python"]','active','4.7',156,28],
    [realSpecIds[2],catIds[1],'Разработка веб-приложения на React','SPA на React + TypeScript.','["Архитектура","Разработка"]',14,'days','60000.00','["React"]','active','4.8',198,43],
    [realSpecIds[3],catIds[4],'Макияж для фотосессии','Профессиональный макияж.','["Консультация","Макияж"]',1,'days','5000.00','["макияж"]','active','5.0',445,89],
    [realSpecIds[3],catIds[4],'Оформление бровей','Архитектура, окрашивание, ламинирование.','["Коррекция","Ламинирование"]',1,'days','2500.00','["брови"]','active','4.9',312,56],
    [realSpecIds[4],catIds[6],'SEO-аудит сайта','Полный технический аудит.','["Аудит","Чек-лист"]',3,'days','15000.00','["SEO"]','active','4.6',123,21],
    [realSpecIds[5],catIds[7],'Копирайтинг для сайта','Продающие тексты.','["Анализ","Тексты"]',5,'days','12000.00','["копирайтинг"]','active','4.9',167,34],
    [realSpecIds[6],catIds[8],'Профессиональная фотосессия','Индивидуальная, семейная съёмка.','["Съёмка","Обработка"]',3,'days','15000.00','["фото"]','active','4.8',289,52],
    [realSpecIds[8],catIds[3],'Ремонт квартиры под ключ','Полный ремонт.','["Демонтаж","Отделка"]',60,'days','250000.00','["ремонт"]','active','4.9',534,112],
    [realSpecIds[9],catIds[9],'Консультация юриста','Консультация по праву.','["Анализ","Рекомендации"]',1,'days','5000.00','["юрист"]','active','4.9',198,38],
    [realSpecIds[10],catIds[6],'Настройка VK Рекламы','Рекламные кампании VK.','["Анализ","A/B тест"]',3,'days','12000.00','["VK"]','active','4.7',145,29],
    [realSpecIds[11],catIds[5],'Подготовка к ЕГЭ по математике','Индивидуальные занятия.','["Диагностика","20 уроков"]',90,'days','30000.00','["ЕГЭ"]','active','4.8',112,22],
    [realSpecIds[14],catIds[1],'Разработка приложения Flutter','Кроссплатформенное приложение.','["Проектирование","Разработка"]',30,'days','120000.00','["Flutter"]','active','4.8',267,58],
    [realSpecIds[0],catIds[0],'Презентация компании','Дизайн для инвесторов.','["Структура","Слайды"]',7,'days','20000.00','["презентация"]','active','4.8',98,18],
    [realSpecIds[3],catIds[4],'Ламинирование ресниц','Долговременная укладка ресниц.','["Очищение","Ламинирование"]',1,'days','3000.00','["ресницы"]','active','5.0',234,47],
    [realSpecIds[9],catIds[9],'Договорная работа','Составление и проверка договоров.','["Анализ","Правки"]',2,'days','8000.00','["договор"]','active','4.9',156,29],
    [realSpecIds[12],catIds[0],'Анимация логотипа','Динамичная анимация логотипа.','["3 концепции","Анимация"]',5,'days','18000.00','["анимация"]','active','4.8',156,31],
    [realSpecIds[13],catIds[6],'Ведение Instagram (1 мес)','Полное ведение профиля.','["Контент-план","Посты"]',30,'days','25000.00','["Instagram"]','active','4.7',178,35],
    [realSpecIds[7],catIds[2],'Внедрение 1С:Управление торговлей','Настройка 1С.','["Аудит","Настройка"]',14,'days','55000.00','["1С"]','active','4.8',87,15],
  ];
  await conn.execute(
    `INSERT INTO services (user_id, category_id, title, description, what_included, deadline_value, deadline_unit, price, tags, status, avg_rating, views, contact_clicks) VALUES ?`,
    [services]
  );

  // Get service IDs
  const [svcRows] = await conn.execute("SELECT id FROM services ORDER BY id");
  const svcIds = (svcRows as any[]).map(r => r.id);

  // Reviews
  const reviews = [
    [svcIds[0],custIds[0],realSpecIds[0],'thumbs_up',5,5,5,'Отличная работа! Логотип превзошёл ожидания.','approved'],
    [svcIds[0],custIds[1],realSpecIds[0],'thumbs_up',5,4,5,'Профессионал высшего класса.','approved'],
    [svcIds[2],custIds[3],realSpecIds[1],'thumbs_up',5,5,4,'Дизайн приложения крутой!','approved'],
    [svcIds[6],custIds[2],realSpecIds[3],'thumbs_up',5,5,5,'Лучший визажист!','approved'],
    [svcIds[6],custIds[1],realSpecIds[3],'thumbs_up',5,5,5,'Анна — волшебница!','approved'],
    [svcIds[8],custIds[3],realSpecIds[4],'thumbs_up',4,4,5,'Трафик вырос на 40%!','approved'],
    [svcIds[9],custIds[2],realSpecIds[5],'thumbs_up',5,5,5,'Конверсия выросла в 2 раза!','approved'],
    [svcIds[10],custIds[1],realSpecIds[6],'thumbs_up',5,4,5,'Потрясающие фото!','approved'],
    [svcIds[11],custIds[0],realSpecIds[8],'thumbs_up',5,5,5,'Ремонт идеально!','approved'],
    [svcIds[12],custIds[2],realSpecIds[9],'thumbs_up',5,5,4,'Грамотная консультация.','approved'],
    [svcIds[13],custIds[3],realSpecIds[10],'thumbs_up',4,4,5,'Лиды идут!','approved'],
    [svcIds[14],custIds[1],realSpecIds[11],'thumbs_up',5,5,5,'92 балла на ЕГЭ!','approved'],
    [svcIds[19],custIds[2],realSpecIds[13],'thumbs_up',4,4,5,'Подписчики растут.','approved'],
    [svcIds[15],custIds[3],realSpecIds[14],'thumbs_up',5,4,5,'Приложение работает отлично.','approved'],
  ];
  await conn.execute(
    `INSERT INTO reviews (service_id, customer_id, specialist_id, overall, quality_rating, timing_rating, communication_rating, text, status) VALUES ?`,
    [reviews]
  );

  // Contacts
  const contacts = [
    [svcIds[0],custIds[0],realSpecIds[0],'completed',1,1,'45000.00'],
    [svcIds[2],custIds[3],realSpecIds[1],'completed',1,1,'80000.00'],
    [svcIds[6],custIds[2],realSpecIds[3],'completed',1,1,'5000.00'],
    [svcIds[9],custIds[2],realSpecIds[5],'deal_started',0,0,'12000.00'],
    [svcIds[11],custIds[0],realSpecIds[8],'completed',1,1,'250000.00'],
    [svcIds[14],custIds[1],realSpecIds[11],'chat',0,0,null],
    [svcIds[15],custIds[3],realSpecIds[14],'completed',1,1,'120000.00'],
  ];
  await conn.execute(
    `INSERT INTO contacts (service_id, customer_id, specialist_id, status, confirmed_by_customer, confirmed_by_specialist, deal_amount) VALUES ?`,
    [contacts]
  );

  // Subscriptions
  const subs = realSpecIds.slice(0,10).map((id, i) => {
    const plans = ['top','top','master','top','master','top','master','expert','top','expert'];
    const renews = [true,true,true,true,false,true,true,true,true,true];
    return [id, plans[i],'active',renews[i]];
  });
  await conn.execute(
    `INSERT INTO subscriptions (user_id, plan, status, auto_renew) VALUES ?`,
    [subs]
  );

  // Tenders
  const tenders = [
    [custIds[0],'Дизайн фирменного стиля','Нужен полный комплект.',catIds[0],'80000.00','2 недели','active','priority',45,3],
    [custIds[1],'Разработка сайта для кофеен','Сайт с меню и онлайн-заказом.',catIds[1],'120000.00','1 месяц','active','urgent',67,5],
    [custIds[2],'SEO-продвижение (6 мес)','Цель — топ-10.',catIds[6],'180000.00','6 месяцев','active','normal',34,2],
    [custIds[3],'Мобильное приложение доставки','Приложение для курьеров.',catIds[1],'300000.00','2 месяца','active','normal',89,7],
    [custIds[0],'Фотосъёмка объектов','5 строительных объектов.',catIds[8],'50000.00','1 неделя','active','normal',23,1],
    [custIds[2],'Копирайтинг для Landing Page','Тексты для 5 страниц.',catIds[7],'25000.00','5 дней','active','normal',41,4],
  ];
  await conn.execute(
    `INSERT INTO tenders (customer_id, title, description, category_id, budget, deadline, status, priority, views, responses) VALUES ?`,
    [tenders]
  );

  // Topics
  const topics = [
    [-1001234567890,1,'guide','📌 ПРАВИЛА И ВХОД','["pin"]'],
    [-1001234567890,2,'tenders','📋 ТЕНДЕРЫ','["post"]'],
    [-1001234567890,3,'deal_logs','🔒 ЛОГИ СДЕЛОК','["post"]'],
    [-1001234567890,4,'reputation','⭐ РЕПУТАЦИЯ','["post"]'],
    [-1001234567890,5,'general','💬 ОБЩИЙ ЧАТ','[]'],
    [-1001234567890,6,'knowledge','📚 БАЗА ЗНАНИЙ','["pin"]'],
    [-1001234567890,7,'mentorship','🎓 НАСТАВНИЧЕСТВО','[]'],
    [-1001234567890,8,'arbitration','🛡 АРБИТРАЖ','[]'],
  ];
  await conn.execute(
    `INSERT INTO topics (group_id, topic_id, topic_slug, topic_name, bot_actions) VALUES ?`,
    [topics]
  );

  // External links
  const links = [
    [realSpecIds[0],'behance','https://behance.net/morozov_design','Behance',true,'approved'],
    [realSpecIds[0],'dprofile','https://dprofile.ru/morozov','Dprofile',true,'approved'],
    [realSpecIds[1],'behance','https://behance.net/sokolova_ui','Behance',true,'approved'],
    [realSpecIds[2],'github','https://github.com/volkovdev','GitHub',true,'approved'],
    [realSpecIds[6],'website','https://lebedev.photo','Сайт-портфолио',true,'approved'],
  ];
  await conn.execute(
    `INSERT INTO external_links (user_id, link_type, url, title, is_visible, status) VALUES ?`,
    [links]
  );

  // Verifications
  const verifications = [
    [realSpecIds[0],'basic','approved','Видеовизитка подтверждена'],
    [realSpecIds[0],'identity','approved','Паспорт проверен'],
    [realSpecIds[1],'basic','approved','Видеовизитка подтверждена'],
    [realSpecIds[3],'basic','approved','Видеовизитка подтверждена'],
    [realSpecIds[3],'identity','approved','Паспорт проверен'],
    [realSpecIds[5],'basic','approved','Видеовизитка подтверждена'],
    [realSpecIds[6],'basic','approved','Видеовизитка подтверждена'],
    [realSpecIds[8],'basic','approved','Видеовизитка подтверждена'],
    [realSpecIds[8],'identity','approved','Паспорт проверен'],
    [realSpecIds[9],'basic','approved','Видеовизитка подтверждена'],
  ];
  await conn.execute(
    `INSERT INTO verifications (user_id, level, status, notes) VALUES ?`,
    [verifications]
  );

  await conn.end();
  console.log("✅ Seed complete!");
}

seed().catch(console.error);

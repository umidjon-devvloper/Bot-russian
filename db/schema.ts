import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  boolean,
  json,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── 1. USERS ───────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  username: varchar("username", { length: 100 }),
  photoUrl: text("photo_url"),
  role: varchar("role", { length: 20 }).default("specialist"), // specialist | customer | both | admin
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  bio: text("bio"),
  profileCompletion: int("profile_completion").default(0),
  isBlocked: boolean("is_blocked").default(false),
  onboardingComplete: boolean("onboarding_complete").default(false),
  selectedRole: varchar("selected_role", { length: 20 }),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 2. SPECIALIST PROFILES ─────────────────────────────────────────────
export const specialistProfiles = mysqlTable("specialist_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .unique()
    .references(() => users.id),
  specialization: varchar("specialization", { length: 200 }),
  status: varchar("status", { length: 20 }).default("candidate"), // candidate | master | expert | top
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalContacts: int("total_contacts").default(0),
  totalReviews: int("total_reviews").default(0),
  totalDeals: int("total_deals").default(0),
  avgQuality: decimal("avg_quality", { precision: 2, scale: 1 }).default("0.0"),
  avgTiming: decimal("avg_timing", { precision: 2, scale: 1 }).default("0.0"),
  avgCommunication: decimal("avg_communication", { precision: 2, scale: 1 }).default("0.0"),
  safeDealEnabled: boolean("safe_deal_enabled").default(true),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 3. CUSTOMER PROFILES ───────────────────────────────────────────────
export const customerProfiles = mysqlTable("customer_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .unique()
    .references(() => users.id),
  companyName: varchar("company_name", { length: 200 }),
  innOgrn: varchar("inn_ogrn", { length: 50 }),
  totalPublications: int("total_publications").default(0),
  totalHires: int("total_hires").default(0),
  status: varchar("status", { length: 20 }).default("new"), // new | verified | company
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 4. CATEGORIES ──────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  icon: varchar("icon", { length: 10 }),
  emoji: varchar("emoji", { length: 10 }),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 5. SERVICES ────────────────────────────────────────────────────────
export const services = mysqlTable("services", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  categoryId: bigint("category_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => categories.id),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  whatIncluded: json("what_included"),
  deadlineValue: int("deadline_value"),
  deadlineUnit: varchar("deadline_unit", { length: 10 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 5 }).default("RUB"),
  safeDeal: boolean("safe_deal").default(true),
  tags: json("tags"),
  status: varchar("status", { length: 20 }).default("pending"), // pending | active | archived | rejected
  rejectionReason: text("rejection_reason"),
  views: int("views").default(0),
  contactClicks: int("contact_clicks").default(0),
  avgRating: decimal("avg_rating", { precision: 2, scale: 1 }).default("0.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 6. SERVICE IMAGES ──────────────────────────────────────────────────
export const serviceImages = mysqlTable("service_images", {
  id: serial("id").primaryKey(),
  serviceId: bigint("service_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => services.id),
  filePath: text("file_path").notNull(),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 7. PORTFOLIOS ──────────────────────────────────────────────────────
export const portfolios = mysqlTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  serviceId: bigint("service_id", { mode: "number", unsigned: true })
    .references(() => services.id),
  description: text("description"),
  tags: json("tags"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 8. PORTFOLIO IMAGES ────────────────────────────────────────────────
export const portfolioImages = mysqlTable("portfolio_images", {
  id: serial("id").primaryKey(),
  portfolioId: bigint("portfolio_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => portfolios.id),
  filePath: text("file_path").notNull(),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 9. EXTERNAL LINKS ──────────────────────────────────────────────────
export const externalLinks = mysqlTable("external_links", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  linkType: varchar("link_type", { length: 30 }).notNull(), // behance | github | linkedin | telegram_channel | website | dprofile | etc
  url: text("url").notNull(),
  title: varchar("title", { length: 100 }),
  isVisible: boolean("is_visible").default(false),
  status: varchar("status", { length: 20 }).default("pending"),
  reviewedBy: bigint("reviewed_by", { mode: "number", unsigned: true })
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 10. REVIEWS ────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  serviceId: bigint("service_id", { mode: "number", unsigned: true })
    .references(() => services.id),
  customerId: bigint("customer_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  specialistId: bigint("specialist_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  contactId: bigint("contact_id", { mode: "number", unsigned: true }),
  overall: varchar("overall", { length: 10 }), // thumbs_up | neutral | thumbs_down
  qualityRating: int("quality_rating"),
  timingRating: int("timing_rating"),
  communicationRating: int("communication_rating"),
  text: text("text"),
  specialistReply: text("specialist_reply"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 11. REVIEW IMAGES ──────────────────────────────────────────────────
export const reviewImages = mysqlTable("review_images", {
  id: serial("id").primaryKey(),
  reviewId: bigint("review_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => reviews.id),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 12. VERIFICATIONS ──────────────────────────────────────────────────
export const verifications = mysqlTable("verifications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  level: varchar("level", { length: 20 }).notNull(), // basic | identity | professional
  documents: json("documents"),
  status: varchar("status", { length: 20 }).default("pending"), // pending | approved | rejected
  notes: text("notes"),
  reviewedBy: bigint("reviewed_by", { mode: "number", unsigned: true })
    .references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 13. CONTACTS ───────────────────────────────────────────────────────
export const contacts = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  serviceId: bigint("service_id", { mode: "number", unsigned: true })
    .references(() => services.id),
  customerId: bigint("customer_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  specialistId: bigint("specialist_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  status: varchar("status", { length: 20 }).default("chat"), // chat | deal_started | completed | disputed | cancelled
  confirmedByCustomer: boolean("confirmed_by_customer").default(false),
  confirmedBySpecialist: boolean("confirmed_by_specialist").default(false),
  dealAmount: decimal("deal_amount", { precision: 10, scale: 2 }),
  dealDeadline: varchar("deal_deadline", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 14. CHANNEL PUBLICATIONS ───────────────────────────────────────────
export const channelPublications = mysqlTable("channel_publications", {
  id: serial("id").primaryKey(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  channels: json("channels"),
  title: varchar("title", { length: 100 }),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("pending_payment"),
  reviewedBy: bigint("reviewed_by", { mode: "number", unsigned: true })
    .references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 15. SUBSCRIPTIONS ──────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  plan: varchar("plan", { length: 20 }).notNull(), // candidate | master | top
  status: varchar("status", { length: 20 }).default("active"),
  validUntil: timestamp("valid_until"),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 16. INTERVIEWS ─────────────────────────────────────────────────────
export const interviews = mysqlTable("interviews", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  scheduledAt: timestamp("scheduled_at"),
  status: varchar("status", { length: 20 }).default("pending"),
  notes: text("notes"),
  decision: varchar("decision", { length: 20 }), // approved | rejected
  interviewerId: bigint("interviewer_id", { mode: "number", unsigned: true })
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 17. ESCROW TRANSACTIONS ────────────────────────────────────────────
export const escrowTransactions = mysqlTable("escrow_transactions", {
  id: serial("id").primaryKey(),
  contactId: bigint("contact_id", { mode: "number", unsigned: true })
    .references(() => contacts.id),
  escrowServiceId: varchar("escrow_service_id", { length: 100 }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending | funded | released | disputed | refunded
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 18. TOPICS ─────────────────────────────────────────────────────────
export const topics = mysqlTable("topics", {
  id: serial("id").primaryKey(),
  groupId: bigint("group_id", { mode: "number" }).notNull(),
  topicId: bigint("topic_id", { mode: "number" }).notNull(),
  topicSlug: varchar("topic_slug", { length: 50 }).notNull().unique(),
  topicName: varchar("topic_name", { length: 100 }).notNull(),
  botActions: json("bot_actions"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 19. AUTO POST TEMPLATES ────────────────────────────────────────────
export const autoPostTemplates = mysqlTable("auto_post_templates", {
  id: serial("id").primaryKey(),
  trigger: varchar("trigger", { length: 50 }).notNull(),
  topicSlug: varchar("topic_slug", { length: 50 }).notNull(),
  templateText: text("template_text").notNull(),
  buttonText: varchar("button_text", { length: 64 }),
  buttonType: varchar("button_type", { length: 20 }),
  buttonUrl: text("button_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 20. FAVORITES ──────────────────────────────────────────────────────
export const favorites = mysqlTable("favorites", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  serviceId: bigint("service_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => services.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 21. NOTIFICATIONS ──────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body"),
  data: json("data"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 22. MODERATION LOG ─────────────────────────────────────────────────
export const moderationLog = mysqlTable("moderation_log", {
  id: serial("id").primaryKey(),
  adminId: bigint("admin_id", { mode: "number", unsigned: true })
    .references(() => users.id),
  targetType: varchar("target_type", { length: 30 }).notNull(), // user | service | portfolio | review | link | publication
  targetId: bigint("target_id", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 30 }).notNull(), // approve | reject | block | unblock | pin | delete
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 23. TENDERS ────────────────────────────────────────────────────────
export const tenders = mysqlTable("tenders", {
  id: serial("id").primaryKey(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  categoryId: bigint("category_id", { mode: "number", unsigned: true })
    .references(() => categories.id),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  deadline: varchar("deadline", { length: 50 }),
  status: varchar("status", { length: 20 }).default("active"), // active | in_progress | completed | cancelled
  priority: varchar("priority", { length: 20 }).default("normal"), // normal | priority | urgent
  views: int("views").default(0),
  responses: int("responses").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Type Exports ───────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SpecialistProfile = typeof specialistProfiles.$inferSelect;
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceImage = typeof serviceImages.$inferSelect;
export type Portfolio = typeof portfolios.$inferSelect;
export type PortfolioImage = typeof portfolioImages.$inferSelect;
export type ExternalLink = typeof externalLinks.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type ReviewImage = typeof reviewImages.$inferSelect;
export type Verification = typeof verifications.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type ChannelPublication = typeof channelPublications.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
export type EscrowTransaction = typeof escrowTransactions.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type AutoPostTemplate = typeof autoPostTemplates.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ModerationLog = typeof moderationLog.$inferSelect;
export type Tender = typeof tenders.$inferSelect;

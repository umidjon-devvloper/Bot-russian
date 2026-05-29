import { relations } from "drizzle-orm";
import {
  users,
  specialistProfiles,
  customerProfiles,
  services,
  serviceImages,
  portfolios,
  portfolioImages,
  externalLinks,
  reviews,
  reviewImages,
  verifications,
  contacts,
  favorites,
  notifications,
  subscriptions,
  interviews,
  escrowTransactions,
  channelPublications,
  categories,
  tenders,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  specialistProfile: one(specialistProfiles, {
    fields: [users.id],
    references: [specialistProfiles.userId],
  }),
  customerProfile: one(customerProfiles, {
    fields: [users.id],
    references: [customerProfiles.userId],
  }),
  services: many(services),
  portfolios: many(portfolios),
  externalLinks: many(externalLinks),
  reviewsAsSpecialist: many(reviews, { relationName: "specialistReviews" }),
  reviewsAsCustomer: many(reviews, { relationName: "customerReviews" }),
  verifications: many(verifications),
  contactsAsCustomer: many(contacts, { relationName: "customerContacts" }),
  contactsAsSpecialist: many(contacts, { relationName: "specialistContacts" }),
  favorites: many(favorites),
  notifications: many(notifications),
  subscriptions: many(subscriptions),
  interviews: many(interviews),
}));

export const specialistProfilesRelations = relations(specialistProfiles, ({ one }) => ({
  user: one(users, {
    fields: [specialistProfiles.userId],
    references: [users.id],
  }),
}));

export const customerProfilesRelations = relations(customerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [customerProfiles.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
  tenders: many(tenders),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  user: one(users, {
    fields: [services.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  images: many(serviceImages),
  reviews: many(reviews),
  portfolios: many(portfolios),
}));

export const serviceImagesRelations = relations(serviceImages, ({ one }) => ({
  service: one(services, {
    fields: [serviceImages.serviceId],
    references: [services.id],
  }),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [portfolios.serviceId],
    references: [services.id],
  }),
  images: many(portfolioImages),
}));

export const portfolioImagesRelations = relations(portfolioImages, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [portfolioImages.portfolioId],
    references: [portfolios.id],
  }),
}));

export const externalLinksRelations = relations(externalLinks, ({ one }) => ({
  user: one(users, {
    fields: [externalLinks.userId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  service: one(services, {
    fields: [reviews.serviceId],
    references: [services.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
    relationName: "customerReviews",
  }),
  specialist: one(users, {
    fields: [reviews.specialistId],
    references: [users.id],
    relationName: "specialistReviews",
  }),
  images: many(reviewImages),
}));

export const reviewImagesRelations = relations(reviewImages, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewImages.reviewId],
    references: [reviews.id],
  }),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  user: one(users, {
    fields: [verifications.userId],
    references: [users.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  customer: one(users, {
    fields: [contacts.customerId],
    references: [users.id],
    relationName: "customerContacts",
  }),
  specialist: one(users, {
    fields: [contacts.specialistId],
    references: [users.id],
    relationName: "specialistContacts",
  }),
  service: one(services, {
    fields: [contacts.serviceId],
    references: [services.id],
  }),
  escrowTransactions: many(escrowTransactions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  user: one(users, {
    fields: [interviews.userId],
    references: [users.id],
  }),
}));

export const escrowTransactionsRelations = relations(escrowTransactions, ({ one }) => ({
  contact: one(contacts, {
    fields: [escrowTransactions.contactId],
    references: [contacts.id],
  }),
}));

export const channelPublicationsRelations = relations(channelPublications, ({ one }) => ({
  customer: one(users, {
    fields: [channelPublications.customerId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [favorites.serviceId],
    references: [services.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const tendersRelations = relations(tenders, ({ one }) => ({
  customer: one(users, {
    fields: [tenders.customerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [tenders.categoryId],
    references: [categories.id],
  }),
}));

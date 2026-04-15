import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ ENUMS ============

export const userRoleEnum = pgEnum("user_role", ["user", "seller", "admin"]);
export const planTypeEnum = pgEnum("plan_type", [
  "raiz_solidaria",
  "desarrollo_rural",
  "impacto_global",
]);
export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "annual"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trial",
  "expired",
  "cancelled",
]);

// ============ USERS ============

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ PLANS ============

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: planTypeEnum("slug").notNull().unique(),
  description: text("description"),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  priceAnnual: decimal("price_annual", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  trialDays: integer("trial_days").default(0),
  features: text("features"), // JSON string of features
  hasChatbot: boolean("has_chatbot").default(false),
  hasAiSuggestions: boolean("has_ai_suggestions").default(false),
  hasDetailedStats: boolean("has_detailed_stats").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ SUBSCRIPTIONS ============

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  planId: integer("plan_id")
    .references(() => plans.id)
    .notNull(),
  billingCycle: billingCycleEnum("billing_cycle").notNull(),
  status: subscriptionStatusEnum("status").default("trial").notNull(),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodStart: timestamp("current_period_start").defaultNow().notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  cancelledAt: timestamp("cancelled_at"),
});

// ============ PRODUCTS ============

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  category: varchar("category", { length: 100 }),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ SALES ============

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  buyerId: integer("buyer_id")
    .references(() => users.id)
    .notNull(),
  sellerId: integer("seller_id")
    .references(() => users.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ DONATIONS ============

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  subscriptionId: integer("subscription_id").references(
    () => subscriptions.id
  ),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(), // "plan_purchase", "direct"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ AI USAGE ============

export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "chat", "suggestion"
  prompt: text("prompt"),
  response: text("response"),
  tokensUsed: integer("tokens_used").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ AI SUGGESTIONS ============

export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  suggestion: text("suggestion").notNull(),
  sentByEmail: boolean("sent_by_email").default(false),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ NOTIFICATIONS ============

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ SERVICES ============

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ RELATIONS ============

export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  products: many(products),
  salesAsBuyer: many(sales, { relationName: "buyer" }),
  salesAsSeller: many(sales, { relationName: "seller" }),
  donations: many(donations),
  aiUsage: many(aiUsage),
  aiSuggestions: many(aiSuggestions),
  notifications: many(notifications),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, { fields: [products.sellerId], references: [users.id] }),
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  product: one(products, {
    fields: [sales.productId],
    references: [products.id],
  }),
  buyer: one(users, {
    fields: [sales.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [sales.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  user: one(users, { fields: [donations.userId], references: [users.id] }),
}));

export const aiUsageRelations = relations(aiUsage, ({ one }) => ({
  user: one(users, { fields: [aiUsage.userId], references: [users.id] }),
}));

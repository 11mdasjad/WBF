import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey();
const created = () => text("created_at").notNull();
export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull().default(""),
  verified: integer("verified").notNull().default(0),
  active: integer("active").notNull().default(1),
  createdAt: created(),
});
export const roles = sqliteTable("roles", {
  id: id(),
  name: text("name").notNull().unique(),
});
export const permissions = sqliteTable("permissions", {
  id: id(),
  name: text("name").notNull().unique(),
});
export const userRoles = sqliteTable(
  "user_roles",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id),
  },
  (t) => [uniqueIndex("user_role_unique").on(t.userId, t.roleId)],
);
export const rolePermissions = sqliteTable(
  "role_permissions",
  {
    id: id(),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id),
  },
  (t) => [uniqueIndex("role_permission_unique").on(t.roleId, t.permissionId)],
);
export const sessions = sqliteTable(
  "sessions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: text("expires_at").notNull(),
    createdAt: created(),
  },
  (t) => [index("sessions_user").on(t.userId)],
);
export const tokens = sqliteTable("tokens", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  kind: text("kind").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: created(),
});
export const settings = sqliteTable("settings", {
  id: id(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});
export const content = sqliteTable(
  "content",
  {
    id: id(),
    kind: text("kind").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    body: text("body").notNull().default(""),
    image: text("image").notNull().default(""),
    category: text("category").notNull().default(""),
    status: text("status").notNull().default("draft"),
    sort: integer("sort").notNull().default(0),
    data: text("data").notNull().default("{}"),
    source: text("source").notNull().default(""),
    publishedAt: text("published_at"),
    createdAt: created(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("content_slug").on(t.kind, t.slug),
    index("content_public").on(t.kind, t.status),
  ],
);
export const revisions = sqliteTable("content_revisions", {
  id: id(),
  contentId: text("content_id")
    .notNull()
    .references(() => content.id),
  snapshot: text("snapshot").notNull(),
  userId: text("user_id").references(() => users.id),
  createdAt: created(),
});
export const applications = sqliteTable(
  "applications",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    kind: text("kind").notNull(),
    contentId: text("content_id").references(() => content.id),
    reference: text("reference").notNull().unique(),
    dedupe: text("dedupe").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    data: text("data").notNull(),
    status: text("status").notNull().default("pending"),
    notes: text("notes").notNull().default(""),
    createdAt: created(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [index("application_user").on(t.userId)],
);
export const applicationHistory = sqliteTable("application_history", {
  id: id(),
  applicationId: text("application_id")
    .notNull()
    .references(() => applications.id),
  status: text("status").notNull(),
  message: text("message").notNull().default(""),
  actorId: text("actor_id").references(() => users.id),
  createdAt: created(),
});
export const contacts = sqliteTable("contacts", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  notes: text("notes").notNull().default(""),
  createdAt: created(),
});
export const donations = sqliteTable(
  "donations",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("INR"),
    purpose: text("purpose").notNull(),
    anonymous: integer("anonymous").notNull().default(0),
    status: text("status").notNull().default("pending"),
    dedupe: text("dedupe").notNull().unique(),
    createdAt: created(),
  },
  (t) => [index("donations_user").on(t.userId)],
);
export const paymentOrders = sqliteTable("payment_orders", {
  id: id(),
  donationId: text("donation_id")
    .notNull()
    .references(() => donations.id),
  providerId: text("provider_id").notNull().unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull().default("created"),
  createdAt: created(),
});
export const transactions = sqliteTable("payment_transactions", {
  id: id(),
  orderId: text("order_id")
    .notNull()
    .references(() => paymentOrders.id),
  providerId: text("provider_id").notNull().unique(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  createdAt: created(),
});
export const receipts = sqliteTable("receipts", {
  id: id(),
  donationId: text("donation_id")
    .notNull()
    .unique()
    .references(() => donations.id),
  number: text("number").notNull().unique(),
  createdAt: created(),
});
export const webhookEvents = sqliteTable("webhook_events", {
  id: id(),
  type: text("type").notNull(),
  createdAt: created(),
});
export const notifications = sqliteTable("notifications", {
  id: id(),
  userId: text("user_id").references(() => users.id),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: created(),
});
export const media = sqliteTable("media", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  key: text("key").notNull().unique(),
  alt: text("alt").notNull(),
  caption: text("caption").notNull().default(""),
  visibility: text("visibility").notNull().default("public"),
  createdAt: created(),
});
export const auditLogs = sqliteTable("audit_logs", {
  id: id(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  target: text("target").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: created(),
});
export const rateLimits = sqliteTable("rate_limits", {
  id: id(),
  count: integer("count").notNull(),
  expiresAt: integer("expires_at").notNull(),
});
export const storeOrders = sqliteTable("store_orders", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  reference: text("reference").notNull().unique(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("inquiry"),
  address: text("address").notNull(),
  createdAt: created(),
});
export const storeItems = sqliteTable("store_items", {
  id: id(),
  orderId: text("order_id")
    .notNull()
    .references(() => storeOrders.id),
  productId: text("product_id")
    .notNull()
    .references(() => content.id),
  quantity: integer("quantity").notNull(),
  unitAmount: integer("unit_amount").notNull(),
});

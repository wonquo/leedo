import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "agent"]);
export const userStatusEnum = pgEnum("user_status", ["active", "invited", "disabled"]);
export const customerOptionTypeEnum = pgEnum("customer_option_type", ["source", "status"]);

export const appUsers = pgTable(
  "app_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    loginId: text("login_id").notNull(),
    passwordHash: text("password_hash").notNull(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    profileImageUrl: text("profile_image_url"),
    role: userRoleEnum("role").notNull().default("agent"),
    status: userStatusEnum("status").notNull().default("active"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("app_users_login_id_idx").on(table.loginId),
    uniqueIndex("app_users_email_idx").on(table.email),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: text("source").notNull().default(""),
    salesPotential: text("sales_potential"),
    phone: text("phone").notNull(),
    gender: text("gender"),
    ageDecade: text("age_decade"),
    status: text("status"),
    callNote: text("call_note"),
    lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
    lastContactedLabel: text("last_contacted_label"),
    orderNote: text("order_note"),
    remark: text("remark"),
    tags: text("tags").array().notNull().default([]),
    assignedUserId: uuid("assigned_user_id").references(() => appUsers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("customers_phone_idx").on(table.phone),
    index("customers_source_idx").on(table.source),
    index("customers_sales_potential_idx").on(table.salesPotential),
    index("customers_status_idx").on(table.status),
    index("customers_assigned_user_idx").on(table.assignedUserId),
    index("customers_assigned_updated_idx").on(table.assignedUserId, table.updatedAt),
    index("customers_assigned_updated_id_desc_idx").on(
      table.assignedUserId,
      table.updatedAt.desc(),
      table.id.desc(),
    ),
    index("customers_assigned_source_updated_idx").on(
      table.assignedUserId,
      table.source,
      table.updatedAt.desc(),
      table.id.desc(),
    ),
    index("customers_assigned_sales_potential_updated_idx").on(
      table.assignedUserId,
      table.salesPotential,
      table.updatedAt.desc(),
      table.id.desc(),
    ),
    index("customers_assigned_status_updated_idx").on(
      table.assignedUserId,
      table.status,
      table.updatedAt.desc(),
      table.id.desc(),
    ),
    index("customers_assigned_gender_updated_idx").on(
      table.assignedUserId,
      table.gender,
      table.updatedAt.desc(),
      table.id.desc(),
    ),
    index("customers_assigned_age_updated_idx").on(
      table.assignedUserId,
      table.ageDecade,
      table.updatedAt.desc(),
      table.id.desc(),
    ),
  ],
);

export const customerOptions = pgTable(
  "customer_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: customerOptionTypeEnum("type").notNull(),
    label: text("label").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("customer_options_type_label_idx").on(table.type, table.label),
    index("customer_options_type_sort_idx").on(table.type, table.sortOrder),
  ],
);

export const customerActivities = pgTable(
  "customer_activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    status: text("status"),
    note: text("note"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid("created_by").references(() => appUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("customer_activities_customer_idx").on(table.customerId),
    index("customer_activities_occurred_idx").on(table.occurredAt),
  ],
);

export const notices = pgTable(
  "notices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    isPinned: boolean("is_pinned").notNull().default(false),
    popupEnabled: boolean("popup_enabled").notNull().default(false),
    popupStartsAt: timestamp("popup_starts_at", { withTimezone: true }),
    popupEndsAt: timestamp("popup_ends_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => appUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notices_pinned_created_idx").on(table.isPinned, table.createdAt),
    index("notices_popup_idx").on(table.popupEnabled, table.popupStartsAt, table.popupEndsAt),
  ],
);

export const noticeComments = pgTable(
  "notice_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    noticeId: uuid("notice_id")
      .notNull()
      .references(() => notices.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdBy: uuid("created_by").references(() => appUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notice_comments_notice_idx").on(table.noticeId),
    index("notice_comments_created_idx").on(table.createdAt),
  ],
);

export const importBatches = pgTable("import_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileName: text("file_name").notNull(),
  sheetName: text("sheet_name").notNull(),
  rowCount: integer("row_count").notNull().default(0),
  importedBy: uuid("imported_by").references(() => appUsers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const customerImportRows = pgTable(
  "customer_import_rows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => importBatches.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    sourceRowNumber: integer("source_row_number").notNull(),
    rawData: jsonb("raw_data").notNull(),
  },
  (table) => [
    index("customer_import_rows_batch_idx").on(table.batchId),
    index("customer_import_rows_customer_idx").on(table.customerId),
  ],
);

export const appUsersRelations = relations(appUsers, ({ many }) => ({
  assignedCustomers: many(customers),
  activities: many(customerActivities),
  notices: many(notices),
  noticeComments: many(noticeComments),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  assignedUser: one(appUsers, {
    fields: [customers.assignedUserId],
    references: [appUsers.id],
  }),
  activities: many(customerActivities),
}));

export const customerActivitiesRelations = relations(customerActivities, ({ one }) => ({
  customer: one(customers, {
    fields: [customerActivities.customerId],
    references: [customers.id],
  }),
  creator: one(appUsers, {
    fields: [customerActivities.createdBy],
    references: [appUsers.id],
  }),
}));

export const noticesRelations = relations(notices, ({ one, many }) => ({
  author: one(appUsers, {
    fields: [notices.createdBy],
    references: [appUsers.id],
  }),
  comments: many(noticeComments),
}));

export const noticeCommentsRelations = relations(noticeComments, ({ one }) => ({
  notice: one(notices, {
    fields: [noticeComments.noticeId],
    references: [notices.id],
  }),
  author: one(appUsers, {
    fields: [noticeComments.createdBy],
    references: [appUsers.id],
  }),
}));

export type AppUserRole = (typeof userRoleEnum.enumValues)[number];
export type AppUserStatus = (typeof userStatusEnum.enumValues)[number];
export type CustomerOptionType = (typeof customerOptionTypeEnum.enumValues)[number];

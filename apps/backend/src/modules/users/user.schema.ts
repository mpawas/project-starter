import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'User',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('passwordHash', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('User_email_idx').on(table.email)],
);

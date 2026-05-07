import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const roles = pgTable('Role', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  createdAt: timestamp('createdAt', { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

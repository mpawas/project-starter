import { index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { roles } from '../roles/role.schema';
import { users } from './user.schema';

export const userRoles = pgTable(
  'UserRole',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('roleId')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
    index('UserRole_roleId_idx').on(table.roleId),
  ],
);

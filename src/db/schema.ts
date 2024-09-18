import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

import type { AdapterAccountType } from 'next-auth/adapters';

export const days = pgTable(
  'day',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    date: timestamp('date').notNull(),
    breakfast: text('breakfast'),
    morning: text('morning').notNull(),
    lunch: text('lunch'),
    afternoon: text('afternoon').notNull(),
    diner: text('diner'),
    link: text('link'),
    travelId: text('travel_id').references(() => travels.id),
  },
  (table) => ({
    unq: unique().on(table.travelId, table.date),
  }),
);

export const daysRelations = relations(days, ({ one }) => ({
  travel: one(travels, {
    fields: [days.travelId],
    references: [travels.id],
  }),
}));

export const travels = pgTable('travel', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  country: text('country').notNull(),
  dateFrom: timestamp('from').notNull(),
  dateTo: timestamp('to').notNull(),
  userId: text('user_id').references(() => users.id),
});

export const travelsRelations = relations(travels, ({ one, many }) => ({
  user: one(users, {
    fields: [travels.userId],
    references: [users.id],
  }),
  days: many(days),
}));

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
});

export const usersRelations = relations(users, ({ one }) => ({
  travel: one(travels, {
    fields: [users.id],
    references: [travels.userId],
  }),
}));

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => ({
    pk: primaryKey({
      name: 'authenticator_userId_credentialID_pk',
      columns: [authenticator.credentialID, authenticator.userId],
    }),
  }),
);

export type User = typeof users.$inferSelect;
export type Travel = typeof travels.$inferSelect;
export type Day = typeof days.$inferSelect;

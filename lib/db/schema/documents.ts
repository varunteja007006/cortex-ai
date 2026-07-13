import { text, timestamp, boolean, pgTable } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const documents = pgTable("documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  fileHash: text("file_hash").notNull(),
  ingested: boolean("ingested").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull()
    .$onUpdateFn(() => sql`now()`),
});

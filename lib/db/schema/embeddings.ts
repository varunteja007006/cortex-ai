import { text, pgTable, index } from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";
import { resources } from "./resources";

export const embeddings = pgTable(
  "embeddings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resourceId: text("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => ({
    hnswIndex: index("embeddings_hnsw_idx")
      .using("hnsw", table.embedding.op("vector_cosine_ops")),
  }),
);

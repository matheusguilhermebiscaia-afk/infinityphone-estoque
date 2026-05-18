import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { produtosTable } from "./produtos";

export const estoqueTable = pgTable("estoque", {
  id: serial("id").primaryKey(),
  produtoId: integer("produto_id").notNull().references(() => produtosTable.id, { onDelete: "cascade" }),
  lojaNumero: integer("loja_numero").notNull(),
  quantidade: integer("quantidade").notNull().default(0),
});

export const insertEstoqueSchema = createInsertSchema(estoqueTable).omit({ id: true });
export type InsertEstoque = z.infer<typeof insertEstoqueSchema>;
export type Estoque = typeof estoqueTable.$inferSelect;

import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { produtosTable } from "./produtos";

export const movimentacoesTable = pgTable("movimentacoes", {
  id: serial("id").primaryKey(),
  produtoId: integer("produto_id").notNull().references(() => produtosTable.id, { onDelete: "cascade" }),
  lojaNumero: integer("loja_numero").notNull(),
  tipo: text("tipo").notNull(), // "entrada" | "saida"
  quantidade: integer("quantidade").notNull(),
  data: timestamp("data", { withTimezone: true }).notNull().defaultNow(),
  observacao: text("observacao"),
});

export const insertMovimentacaoSchema = createInsertSchema(movimentacoesTable).omit({
  id: true,
  data: true,
});

export type InsertMovimentacao = z.infer<typeof insertMovimentacaoSchema>;
export type Movimentacao = typeof movimentacoesTable.$inferSelect;

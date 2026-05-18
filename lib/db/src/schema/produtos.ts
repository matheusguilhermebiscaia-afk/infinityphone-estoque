import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const produtosTable = pgTable("produtos", {
  id: serial("id").primaryKey(),
  modelo: text("modelo").notNull(),
  marca: text("marca").notNull(),
  cor: text("cor").notNull(),
  armazenamentoGb: integer("armazenamento_gb").notNull(),
  ramGb: integer("ram_gb").notNull(),
  precoCusto: numeric("preco_custo", { precision: 10, scale: 2 }).notNull(),
  precoVenda: numeric("preco_venda", { precision: 10, scale: 2 }).notNull(),
  statusNovoUsado: text("status_novo_usado").notNull().default("novo"),
  imagemUrl: text("imagem_url"),
  imagemFile: text("imagem_file"),
  dataCadastro: timestamp("data_cadastro", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProdutoSchema = createInsertSchema(produtosTable).omit({
  id: true,
  dataCadastro: true,
});

export type InsertProduto = z.infer<typeof insertProdutoSchema>;
export type Produto = typeof produtosTable.$inferSelect;

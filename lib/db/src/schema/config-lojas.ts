import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const configLojasTable = pgTable("config_lojas", {
  id: serial("id").primaryKey(),
  lojaNumero: integer("loja_numero").notNull().unique(),
  nomeLoja: text("nome_loja").notNull().default(""),
  endereco: text("endereco").notNull().default(""),
  telefone: text("telefone").notNull().default(""),
});

export const insertConfigLojaSchema = createInsertSchema(configLojasTable).omit({ id: true });
export type InsertConfigLoja = z.infer<typeof insertConfigLojaSchema>;
export type ConfigLoja = typeof configLojasTable.$inferSelect;

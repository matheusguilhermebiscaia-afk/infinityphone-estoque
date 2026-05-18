import { Router } from "express";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { db, movimentacoesTable, produtosTable, estoqueTable } from "@workspace/db";

const router: import("express").IRouter = Router();

function sevenDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

router.get("/relatorios/entradas-recentes", async (_req, res): Promise<void> => {
  const since = sevenDaysAgo();
  const rows = await db
    .select({
      produtoId: movimentacoesTable.produtoId,
      modelo: produtosTable.modelo,
      marca: produtosTable.marca,
      lojaNumero: movimentacoesTable.lojaNumero,
      quantidade: movimentacoesTable.quantidade,
      data: movimentacoesTable.data,
    })
    .from(movimentacoesTable)
    .innerJoin(produtosTable, eq(movimentacoesTable.produtoId, produtosTable.id))
    .where(and(eq(movimentacoesTable.tipo, "entrada"), gte(movimentacoesTable.data, since)))
    .orderBy(movimentacoesTable.data);

  res.json(rows.reverse());
});

router.get("/relatorios/vendas-recentes", async (_req, res): Promise<void> => {
  const since = sevenDaysAgo();
  const rows = await db
    .select({
      lojaNumero: movimentacoesTable.lojaNumero,
      totalVendas: sql<number>`COUNT(*)::int`,
      totalQuantidade: sql<number>`SUM(${movimentacoesTable.quantidade})::int`,
    })
    .from(movimentacoesTable)
    .where(and(eq(movimentacoesTable.tipo, "saida"), gte(movimentacoesTable.data, since)))
    .groupBy(movimentacoesTable.lojaNumero);

  res.json(rows);
});

router.get("/relatorios/sem-estoque", async (_req, res): Promise<void> => {
  const allProdutos = await db.select().from(produtosTable);
  const allEstoque = await db.select().from(estoqueTable);

  const semEstoque = allProdutos.filter((p) => {
    const total = allEstoque
      .filter((e) => e.produtoId === p.id)
      .reduce((sum, e) => sum + e.quantidade, 0);
    return total === 0;
  });

  res.json(semEstoque.map((p) => ({
    ...p,
    precoCusto: parseFloat(p.precoCusto as unknown as string),
    precoVenda: parseFloat(p.precoVenda as unknown as string),
  })));
});

router.get("/relatorios/valor-por-loja", async (_req, res): Promise<void> => {
  const allEstoque = await db.select().from(estoqueTable);
  const allProdutos = await db.select().from(produtosTable);

  const resultado = [1, 2, 3].map((lojaNumero) => {
    const lojaEstoque = allEstoque.filter((e) => e.lojaNumero === lojaNumero);
    let valorTotal = 0;
    let quantidadeTotal = 0;
    for (const e of lojaEstoque) {
      const prod = allProdutos.find((p) => p.id === e.produtoId);
      if (prod) {
        valorTotal += parseFloat(prod.precoVenda as unknown as string) * e.quantidade;
        quantidadeTotal += e.quantidade;
      }
    }
    return { lojaNumero, valorTotal, quantidadeTotal };
  });

  res.json(resultado);
});

router.get("/relatorios/estoque-baixo", async (_req, res): Promise<void> => {
  const allEstoque = await db.select().from(estoqueTable);
  const allProdutos = await db.select().from(produtosTable);

  const alertas = allEstoque
    .filter((e) => e.quantidade <= 2)
    .map((e) => {
      const prod = allProdutos.find((p) => p.id === e.produtoId);
      return {
        produtoId: e.produtoId,
        modelo: prod?.modelo ?? "",
        marca: prod?.marca ?? "",
        lojaNumero: e.lojaNumero,
        quantidade: e.quantidade,
      };
    });

  res.json(alertas);
});

router.get("/relatorios/dashboard", async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [prodCount] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(produtosTable);
  const allEstoque = await db.select().from(estoqueTable);
  const totalItems = allEstoque.reduce((sum, e) => sum + e.quantidade, 0);
  const alertasBaixo = allEstoque.filter((e) => e.quantidade <= 2).length;

  const [entradasHoje] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(movimentacoesTable)
    .where(and(eq(movimentacoesTable.tipo, "entrada"), gte(movimentacoesTable.data, today), lte(movimentacoesTable.data, tomorrow)));

  const [saidasHoje] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(movimentacoesTable)
    .where(and(eq(movimentacoesTable.tipo, "saida"), gte(movimentacoesTable.data, today), lte(movimentacoesTable.data, tomorrow)));

  res.json({
    totalProdutos: prodCount?.count ?? 0,
    totalItensEmEstoque: totalItems,
    alertasEstoqueBaixo: alertasBaixo,
    entradasHoje: entradasHoje?.count ?? 0,
    saidasHoje: saidasHoje?.count ?? 0,
  });
});

export default router;

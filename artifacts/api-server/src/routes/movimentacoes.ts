import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, movimentacoesTable, estoqueTable, produtosTable } from "@workspace/db";
import {
  CreateMovimentacaoBody,
  ListMovimentacoesQueryParams,
} from "@workspace/api-zod";

const router: import("express").IRouter = Router();

router.get("/movimentacoes", async (req, res): Promise<void> => {
  const params = ListMovimentacoesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.produtoId != null) conditions.push(eq(movimentacoesTable.produtoId, params.data.produtoId));
  if (params.data.loja != null) conditions.push(eq(movimentacoesTable.lojaNumero, params.data.loja));
  if (params.data.tipo) conditions.push(eq(movimentacoesTable.tipo, params.data.tipo));

  const movs = await db
    .select({
      id: movimentacoesTable.id,
      produtoId: movimentacoesTable.produtoId,
      produtoModelo: produtosTable.modelo,
      produtoMarca: produtosTable.marca,
      lojaNumero: movimentacoesTable.lojaNumero,
      tipo: movimentacoesTable.tipo,
      quantidade: movimentacoesTable.quantidade,
      data: movimentacoesTable.data,
      observacao: movimentacoesTable.observacao,
    })
    .from(movimentacoesTable)
    .innerJoin(produtosTable, eq(movimentacoesTable.produtoId, produtosTable.id))
    .where(and(...conditions))
    .orderBy(movimentacoesTable.data);

  res.json(movs.reverse());
});

router.post("/movimentacoes", async (req, res): Promise<void> => {
  const parsed = CreateMovimentacaoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { produtoId, lojaNumero, tipo, quantidade, observacao } = parsed.data;

  // Check product exists
  const [produto] = await db.select().from(produtosTable).where(eq(produtosTable.id, produtoId));
  if (!produto) {
    res.status(400).json({ error: "Produto não encontrado" });
    return;
  }

  // Get or create stock row
  const [estoqueRow] = await db
    .select()
    .from(estoqueTable)
    .where(and(eq(estoqueTable.produtoId, produtoId), eq(estoqueTable.lojaNumero, lojaNumero)));

  const currentQty = estoqueRow?.quantidade ?? 0;

  if (tipo === "saida" && currentQty < quantidade) {
    res.status(400).json({ error: `Estoque insuficiente. Disponível: ${currentQty}` });
    return;
  }

  const newQty = tipo === "entrada" ? currentQty + quantidade : currentQty - quantidade;

  if (estoqueRow) {
    await db.update(estoqueTable).set({ quantidade: newQty }).where(eq(estoqueTable.id, estoqueRow.id));
  } else {
    await db.insert(estoqueTable).values({ produtoId, lojaNumero, quantidade: newQty });
  }

  const [mov] = await db
    .insert(movimentacoesTable)
    .values({ produtoId, lojaNumero, tipo, quantidade, observacao: observacao ?? null })
    .returning();

  res.status(201).json({
    id: mov.id,
    produtoId: mov.produtoId,
    produtoModelo: produto.modelo,
    produtoMarca: produto.marca,
    lojaNumero: mov.lojaNumero,
    tipo: mov.tipo,
    quantidade: mov.quantidade,
    data: mov.data,
    observacao: mov.observacao ?? null,
  });
});

export default router;

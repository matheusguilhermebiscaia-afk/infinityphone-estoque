import { Router } from "express";
import { eq, ilike, and, gte, lte, sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { db, produtosTable, estoqueTable, movimentacoesTable, configLojasTable } from "@workspace/db";
import {
  CreateProdutoBody,
  UpdateProdutoBody,
  UpdateProdutoParams,
  GetProdutoParams,
  DeleteProdutoParams,
  ListProdutosQueryParams,
} from "@workspace/api-zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads/produtos");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `produto_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Apenas JPG, PNG ou WebP sao permitidos"));
  },
});

const router: import("express").IRouter = Router();

async function buildProdutoComEstoque(
  produto: typeof produtosTable.$inferSelect,
  estoque: { lojaNumero: number; quantidade: number }[],
  hojeMovs: { produtoId: number }[],
  configLojas: { lojaNumero: number; nomeLoja: string }[],
) {
  const estoqueTotal = estoque.reduce((sum, e) => sum + e.quantidade, 0);
  const chegouHoje = hojeMovs.some((m) => m.produtoId === produto.id);
  return {
    id: produto.id,
    modelo: produto.modelo,
    marca: produto.marca,
    cor: produto.cor,
    armazenamentoGb: produto.armazenamentoGb,
    ramGb: produto.ramGb,
    precoCusto: parseFloat(produto.precoCusto as unknown as string),
    precoVenda: parseFloat(produto.precoVenda as unknown as string),
    statusNovoUsado: produto.statusNovoUsado,
    dataCadastro: produto.dataCadastro,
    imagemUrl: produto.imagemUrl ?? null,
    imagemFile: produto.imagemFile ?? null,
    estoqueTotal,
    estoquePorLoja: [1, 2, 3].map((loja) => ({
      lojaNumero: loja,
      quantidade: estoque.find((e) => e.lojaNumero === loja)?.quantidade ?? 0,
      nomeLoja: configLojas.find((c) => c.lojaNumero === loja)?.nomeLoja || null,
    })),
    chegouHoje,
  };
}

router.get("/produtos", async (req, res): Promise<void> => {
  const params = ListProdutosQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { marca, modelo, precoMin, precoMax, loja, ordenar, chegaram_hoje } = params.data;

  const conditions = [];
  if (marca) conditions.push(eq(produtosTable.marca, marca));
  if (modelo) conditions.push(ilike(produtosTable.modelo, `%${modelo}%`));
  if (precoMin != null) conditions.push(gte(sql`CAST(${produtosTable.precoVenda} AS NUMERIC)`, precoMin));
  if (precoMax != null) conditions.push(lte(sql`CAST(${produtosTable.precoVenda} AS NUMERIC)`, precoMax));

  const [produtos, allEstoque, configLojas] = await Promise.all([
    db.select().from(produtosTable).where(and(...conditions)),
    db.select().from(estoqueTable),
    db.select().from(configLojasTable),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hojeMovs = await db
    .select({ produtoId: movimentacoesTable.produtoId })
    .from(movimentacoesTable)
    .where(and(eq(movimentacoesTable.tipo, "entrada"), gte(movimentacoesTable.data, today)));

  let result = await Promise.all(
    produtos.map((p) =>
      buildProdutoComEstoque(
        p,
        allEstoque.filter((e) => e.produtoId === p.id),
        hojeMovs,
        configLojas,
      ),
    ),
  );

  if (loja != null) {
    result = result.filter((r) => r.estoquePorLoja.find((e) => e.lojaNumero === loja && e.quantidade > 0));
  }

  if (chegaram_hoje) {
    result = result.filter((r) => r.chegouHoje);
  }

  if (ordenar === "recentes") {
    result.sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime());
  } else if (ordenar === "menor_estoque") {
    result.sort((a, b) => a.estoqueTotal - b.estoqueTotal);
  } else if (ordenar === "preco_asc") {
    result.sort((a, b) => a.precoVenda - b.precoVenda);
  } else if (ordenar === "preco_desc") {
    result.sort((a, b) => b.precoVenda - a.precoVenda);
  } else {
    result.sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime());
  }

  res.json(result);
});

router.post("/produtos", async (req, res): Promise<void> => {
  const parsed = CreateProdutoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [produto] = await db.insert(produtosTable).values({
    modelo: parsed.data.modelo,
    marca: parsed.data.marca,
    cor: parsed.data.cor,
    armazenamentoGb: parsed.data.armazenamentoGb,
    ramGb: parsed.data.ramGb,
    precoCusto: String(parsed.data.precoCusto),
    precoVenda: String(parsed.data.precoVenda),
    statusNovoUsado: parsed.data.statusNovoUsado,
    imagemUrl: parsed.data.imagemUrl ?? null,
  }).returning();

  res.status(201).json({
    ...produto,
    precoCusto: parseFloat(produto.precoCusto as unknown as string),
    precoVenda: parseFloat(produto.precoVenda as unknown as string),
  });
});

router.get("/produtos/:id", async (req, res): Promise<void> => {
  const params = GetProdutoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [produto] = await db.select().from(produtosTable).where(eq(produtosTable.id, params.data.id));
  if (!produto) {
    res.status(404).json({ error: "Produto não encontrado" });
    return;
  }

  const [estoque, configLojas] = await Promise.all([
    db.select().from(estoqueTable).where(eq(estoqueTable.produtoId, params.data.id)),
    db.select().from(configLojasTable),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hojeMovs = await db
    .select({ produtoId: movimentacoesTable.produtoId })
    .from(movimentacoesTable)
    .where(and(eq(movimentacoesTable.tipo, "entrada"), gte(movimentacoesTable.data, today)));

  const result = await buildProdutoComEstoque(produto, estoque, hojeMovs, configLojas);
  res.json(result);
});

router.patch("/produtos/:id", async (req, res): Promise<void> => {
  const params = UpdateProdutoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProdutoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.precoCusto != null) updateData.precoCusto = String(parsed.data.precoCusto);
  if (parsed.data.precoVenda != null) updateData.precoVenda = String(parsed.data.precoVenda);

  const [produto] = await db.update(produtosTable).set(updateData).where(eq(produtosTable.id, params.data.id)).returning();
  if (!produto) {
    res.status(404).json({ error: "Produto não encontrado" });
    return;
  }

  res.json({
    ...produto,
    precoCusto: parseFloat(produto.precoCusto as unknown as string),
    precoVenda: parseFloat(produto.precoVenda as unknown as string),
  });
});

router.delete("/produtos/:id", async (req, res): Promise<void> => {
  const params = DeleteProdutoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [produto] = await db.delete(produtosTable).where(eq(produtosTable.id, params.data.id)).returning();
  if (!produto) {
    res.status(404).json({ error: "Produto não encontrado" });
    return;
  }

  res.sendStatus(204);
});

router.post("/produtos/:id/upload-imagem", upload.single("imagem"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID invalido" }); return; }
  if (!req.file) { res.status(400).json({ error: "Nenhum arquivo enviado" }); return; }

  const [produto] = await db
    .update(produtosTable)
    .set({ imagemFile: req.file.filename })
    .where(eq(produtosTable.id, id))
    .returning();

  if (!produto) {
    res.status(404).json({ error: "Produto não encontrado" });
    return;
  }

  res.json({
    imagemFile: req.file.filename,
    url: `/api/uploads/produtos/${req.file.filename}`,
  });
});

export default router;

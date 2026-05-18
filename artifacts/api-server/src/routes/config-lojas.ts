import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, configLojasTable } from "@workspace/db";

const router: import("express").IRouter = Router();

router.get("/config-lojas", async (_req, res): Promise<void> => {
  const lojas = await db.select().from(configLojasTable).orderBy(configLojasTable.lojaNumero);

  const withFallbacks = [1, 2, 3].map((num) => {
    const found = lojas.find((l) => l.lojaNumero === num);
    return found ?? { id: null, lojaNumero: num, nomeLoja: "", endereco: "", telefone: "" };
  });

  res.json(withFallbacks);
});

router.put("/config-lojas", async (req, res): Promise<void> => {
  const { lojas } = req.body as {
    lojas: Array<{ lojaNumero: number; nomeLoja?: string; endereco?: string; telefone?: string }>;
  };

  if (!Array.isArray(lojas)) {
    res.status(400).json({ error: "lojas deve ser um array" });
    return;
  }

  const results = [];
  for (const loja of lojas) {
    const { lojaNumero, nomeLoja = "", endereco = "", telefone = "" } = loja;
    const existing = await db.select().from(configLojasTable).where(eq(configLojasTable.lojaNumero, lojaNumero));

    if (existing.length > 0) {
      const [updated] = await db
        .update(configLojasTable)
        .set({ nomeLoja, endereco, telefone })
        .where(eq(configLojasTable.lojaNumero, lojaNumero))
        .returning();
      results.push(updated);
    } else {
      const [inserted] = await db
        .insert(configLojasTable)
        .values({ lojaNumero, nomeLoja, endereco, telefone })
        .returning();
      results.push(inserted);
    }
  }

  results.sort((a, b) => a.lojaNumero - b.lojaNumero);
  res.json(results);
});

export default router;

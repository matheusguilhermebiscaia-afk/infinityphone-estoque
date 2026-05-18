import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useListMovimentacoes,
  getListMovimentacoesQueryKey,
  useListProdutos,
  getListProdutosQueryKey,
  type ListMovimentacoesParams,
} from "@workspace/api-client-react";
import { ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";

export default function AdminHistorico() {
  const [produtoId, setProdutoId] = useState<number | "">("");
  const [loja, setLoja] = useState<number | "">("");
  const [tipo, setTipo] = useState<"entrada" | "saida" | "">("");

  const { data: produtos } = useListProdutos({}, {
    query: { queryKey: getListProdutosQueryKey() },
  });

  const params: ListMovimentacoesParams = {
    produtoId: produtoId ? Number(produtoId) : undefined,
    loja: loja ? Number(loja) : undefined,
    tipo: tipo || undefined,
  };

  const { data: movimentacoes, isLoading } = useListMovimentacoes(params, {
    query: { queryKey: getListMovimentacoesQueryKey(params) },
  });

  const selectCls = "bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4FF00]/50";

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[#111] rounded-lg flex items-center justify-center">
            <History size={16} className="text-[#D4FF00]" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">Historico</h1>
            <p className="text-[#555] text-sm">Todas as movimentacoes de estoque</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={produtoId} onChange={(e) => setProdutoId(e.target.value ? Number(e.target.value) : "")} className={selectCls}>
            <option value="">Todos os produtos</option>
            {produtos?.map((p) => <option key={p.id} value={p.id}>{p.marca} {p.modelo}</option>)}
          </select>
          <select value={loja} onChange={(e) => setLoja(e.target.value ? Number(e.target.value) : "")} className={selectCls}>
            <option value="">Todas as lojas</option>
            <option value="1">Loja 1</option>
            <option value="2">Loja 2</option>
            <option value="3">Loja 3</option>
          </select>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as any)} className={selectCls}>
            <option value="">Todos os tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saida</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-[#555] py-8">
            <div className="w-5 h-5 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
            Carregando...
          </div>
        ) : !movimentacoes || movimentacoes.length === 0 ? (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-10 text-center">
            <History size={40} className="text-[#2a2a2a] mx-auto mb-3" />
            <p className="text-[#555]">Nenhuma movimentacao encontrada</p>
          </div>
        ) : (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium">Produto</th>
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium hidden sm:table-cell">Loja</th>
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium">Qtd</th>
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium hidden md:table-cell">Data</th>
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium hidden lg:table-cell">Obs</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((m) => (
                  <tr key={m.id} className="border-b border-[#0f0f0f] last:border-0 hover:bg-[#111]">
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded w-fit ${
                        m.tipo === "entrada" ? "bg-[#0a1a0a] text-[#44ff88]" : "bg-[#1a0a0a] text-[#ff7777]"
                      }`}>
                        {m.tipo === "entrada"
                          ? <ArrowDownToLine size={11} />
                          : <ArrowUpFromLine size={11} />}
                        {m.tipo}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white text-sm font-medium">{m.produtoModelo}</div>
                      <div className="text-[#555] text-xs">{m.produtoMarca}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-[#777] text-sm">Loja {m.lojaNumero}</td>
                    <td className="px-4 py-3 text-white text-sm font-bold">{m.quantidade}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-[#555] text-xs">
                      {new Date(m.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[#555] text-xs max-w-[200px] truncate">
                      {m.observacao || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

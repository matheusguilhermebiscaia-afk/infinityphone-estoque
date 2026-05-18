import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useLocation } from "wouter";
import {
  useListProdutos,
  getListProdutosQueryKey,
  useCreateMovimentacao,
  getListMovimentacoesQueryKey,
  getGetDashboardStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, CheckCircle } from "lucide-react";
import { silentBackup } from "@/lib/backup";

export default function AdminEntrada() {
  const [produtoId, setProdutoId] = useState<number | "">("");
  const [loja, setLoja] = useState<1 | 2 | 3>(1);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { data: produtos } = useListProdutos({}, {
    query: { queryKey: getListProdutosQueryKey() },
  });

  const createMov = useCreateMovimentacao({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMovimentacoesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListProdutosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        silentBackup();
        setSuccess(true);
        setProdutoId("");
        setQuantidade(1);
        setObservacao("");
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: (err: any) => {
        setError(err?.response?.data?.error || "Erro ao registrar entrada");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoId) { setError("Selecione um produto"); return; }
    setError("");
    createMov.mutate({
      data: {
        produtoId: Number(produtoId),
        lojaNumero: loja,
        tipo: "entrada",
        quantidade,
        observacao: observacao || undefined,
      },
    });
  };

  const inputCls = "w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4FF00]/50 transition-colors";

  return (
    <AdminLayout>
      <div className="max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[#0a1a0a] border border-[#44ff88]/20 rounded-lg flex items-center justify-center">
            <ArrowDownToLine size={16} className="text-[#44ff88]" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">Entrada de Estoque</h1>
            <p className="text-[#555] text-sm">Registrar chegada de produtos</p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-[#0a1a0a] border border-[#44ff88]/30 rounded-xl px-4 py-3 mb-4">
            <CheckCircle size={15} className="text-[#44ff88]" />
            <span className="text-[#44ff88] text-sm font-medium">Entrada registrada com sucesso!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6 space-y-4">
          <div>
            <label className="text-[#666] text-xs font-medium mb-1.5 block uppercase tracking-wider">Produto</label>
            <select
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value ? Number(e.target.value) : "")}
              className={inputCls}
            >
              <option value="">Selecione um produto...</option>
              {produtos?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.marca} {p.modelo} — {p.cor} {p.armazenamentoGb}GB
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#666] text-xs font-medium mb-1.5 block uppercase tracking-wider">Loja</label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLoja(l)}
                  className={`py-3 rounded-lg font-bold text-sm transition-all ${
                    loja === l ? "bg-[#D4FF00] text-black" : "bg-[#111] border border-[#222] text-[#777] hover:text-white"
                  }`}
                >
                  Loja {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[#666] text-xs font-medium mb-1.5 block uppercase tracking-wider">Quantidade</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="w-10 h-10 rounded-lg bg-[#111] border border-[#222] text-white text-lg font-bold hover:bg-[#1a1a1a] transition-colors">
                -
              </button>
              <input
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                className="flex-1 bg-[#111] border border-[#222] rounded-lg px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:border-[#D4FF00]/50"
              />
              <button type="button" onClick={() => setQuantidade(quantidade + 1)} className="w-10 h-10 rounded-lg bg-[#111] border border-[#222] text-white text-lg font-bold hover:bg-[#1a1a1a] transition-colors">
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-[#666] text-xs font-medium mb-1.5 block uppercase tracking-wider">Observacao (opcional)</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
              placeholder="Ex: Compra de fornecedor, troca, etc."
              className={inputCls + " resize-none"}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={createMov.isPending} className="w-full bg-[#D4FF00] text-black font-black py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {createMov.isPending ? "Registrando..." : "Registrar Entrada"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

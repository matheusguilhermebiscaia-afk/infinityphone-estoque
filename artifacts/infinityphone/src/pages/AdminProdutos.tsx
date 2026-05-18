import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Link } from "wouter";
import {
  useListProdutos,
  getListProdutosQueryKey,
  useDeleteProduto,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Smartphone, Plus, Trash2, Pencil, Search } from "lucide-react";

export default function AdminProdutos() {
  const [busca, setBusca] = useState("");
  const queryClient = useQueryClient();

  const params = { modelo: busca || undefined };
  const { data: produtos, isLoading } = useListProdutos(params, {
    query: { queryKey: getListProdutosQueryKey(params) },
  });

  const deleteProduto = useDeleteProduto({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProdutosQueryKey() });
      },
    },
  });

  const handleDelete = (id: number, modelo: string) => {
    if (confirm(`Remover "${modelo}"? Esta acao nao pode ser desfeita.`)) {
      deleteProduto.mutate({ id });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-black text-2xl">Produtos</h1>
            <p className="text-[#555] text-sm mt-0.5">Gerenciar catalogo de celulares</p>
          </div>
          <Link href="/admin/produtos/novo">
            <button className="bg-[#D4FF00] text-black font-bold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <Plus size={15} />
              Novo Produto
            </button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            type="text"
            placeholder="Buscar por modelo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4FF00]/50 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-[#555] py-8">
            <div className="w-5 h-5 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
            Carregando...
          </div>
        ) : !produtos || produtos.length === 0 ? (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-10 text-center">
            <Smartphone size={40} className="text-[#2a2a2a] mx-auto mb-3" />
            <p className="text-[#555]">Nenhum produto encontrado</p>
            <Link href="/admin/produtos/novo">
              <button className="mt-4 bg-[#D4FF00] text-black font-bold px-4 py-2 rounded-lg text-sm">
                Adicionar primeiro produto
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium">Produto</th>
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium hidden sm:table-cell">Specs</th>
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium">Preco</th>
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium hidden md:table-cell">Estoque</th>
                  <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id} className="border-b border-[#0f0f0f] last:border-0 hover:bg-[#111]">
                    <td className="px-4 py-3">
                      <div className="text-white text-sm font-semibold">{p.modelo}</div>
                      <div className="text-[#555] text-xs">{p.marca} &middot; {p.cor}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-[#777] text-xs">{p.armazenamentoGb}GB &middot; {p.ramGb}GB RAM</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#D4FF00] text-sm font-bold">R$ {Number(p.precoVenda).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                      <div className="text-[#444] text-xs">Custo: R$ {Number(p.precoCusto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-1">
                        {p.estoquePorLoja.map((e) => (
                          <span
                            key={e.lojaNumero}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              e.quantidade === 0 ? "bg-[#1a0a0a] text-[#ff4444]" :
                              e.quantidade <= 2 ? "bg-[#2a1a0a] text-[#ffaa00]" :
                              "bg-[#0a1a0a] text-[#44ff88]"
                            }`}
                          >
                            L{e.lojaNumero}:{e.quantidade}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        p.statusNovoUsado === "novo"
                          ? "bg-[#0a1a0a] text-[#44ff88]"
                          : "bg-[#2a1a0a] text-[#ffaa00]"
                      }`}>
                        {p.statusNovoUsado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/produtos/${p.id}/editar`}>
                          <button className="w-7 h-7 rounded-lg bg-[#111] hover:bg-[#D4FF00]/10 text-[#555] hover:text-[#D4FF00] flex items-center justify-center transition-colors">
                            <Pencil size={12} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.modelo)}
                          className="w-7 h-7 rounded-lg bg-[#111] hover:bg-red-900/30 text-[#555] hover:text-red-400 flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
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

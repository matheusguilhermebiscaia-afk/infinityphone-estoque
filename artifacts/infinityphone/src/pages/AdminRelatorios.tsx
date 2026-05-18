import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useGetEntradasRecentes,
  getGetEntradasRecentesQueryKey,
  useGetVendasRecentes,
  getGetVendasRecentesQueryKey,
  useGetProdutosSemEstoque,
  getGetProdutosSemEstoqueQueryKey,
  useGetValorPorLoja,
  getGetValorPorLojaQueryKey,
} from "@workspace/api-client-react";
import { BarChart3, TrendingDown, Package, DollarSign, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

const TABS = [
  { id: "entradas", label: "Entradas 7 dias", icon: ArrowDownToLine },
  { id: "vendas", label: "Vendas 7 dias", icon: ArrowUpFromLine },
  { id: "sem-estoque", label: "Sem estoque", icon: Package },
  { id: "valor", label: "Valor por Loja", icon: DollarSign },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function AdminRelatorios() {
  const [tab, setTab] = useState<Tab>("entradas");

  const { data: entradas, isLoading: loadingE } = useGetEntradasRecentes({ query: { queryKey: getGetEntradasRecentesQueryKey() } });
  const { data: vendas, isLoading: loadingV } = useGetVendasRecentes({ query: { queryKey: getGetVendasRecentesQueryKey() } });
  const { data: semEstoque, isLoading: loadingSE } = useGetProdutosSemEstoque({ query: { queryKey: getGetProdutosSemEstoqueQueryKey() } });
  const { data: valorLoja, isLoading: loadingVL } = useGetValorPorLoja({ query: { queryKey: getGetValorPorLojaQueryKey() } });

  const isLoading = loadingE || loadingV || loadingSE || loadingVL;

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[#111] rounded-lg flex items-center justify-center">
            <BarChart3 size={16} className="text-[#D4FF00]" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">Relatorios</h1>
            <p className="text-[#555] text-sm">Analise de movimentacoes e estoque</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-1 flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                tab === id ? "bg-[#D4FF00] text-black" : "text-[#555] hover:text-white"
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-[#555] py-8">
            <div className="w-5 h-5 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
            Carregando...
          </div>
        ) : (
          <>
            {tab === "entradas" && (
              <div>
                <p className="text-[#555] text-sm mb-3">{entradas?.length ?? 0} entrada{entradas?.length !== 1 ? "s" : ""} nos ultimos 7 dias</p>
                {!entradas || entradas.length === 0 ? (
                  <EmptyState label="Nenhuma entrada nos ultimos 7 dias" />
                ) : (
                  <Table headers={["Produto", "Loja", "Qtd", "Data"]}>
                    {entradas.map((e, i) => (
                      <tr key={i} className="border-b border-[#0f0f0f] last:border-0 hover:bg-[#111]">
                        <td className="px-4 py-3">
                          <div className="text-white text-sm font-medium">{e.modelo}</div>
                          <div className="text-[#555] text-xs">{e.marca}</div>
                        </td>
                        <td className="px-4 py-3 text-[#777] text-sm">Loja {e.lojaNumero}</td>
                        <td className="px-4 py-3 text-[#44ff88] text-sm font-bold">+{e.quantidade}</td>
                        <td className="px-4 py-3 text-[#555] text-xs">
                          {new Date(e.data).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </Table>
                )}
              </div>
            )}

            {tab === "vendas" && (
              <div>
                <p className="text-[#555] text-sm mb-3">Vendas por loja nos ultimos 7 dias</p>
                {!vendas || vendas.length === 0 ? (
                  <EmptyState label="Nenhuma venda nos ultimos 7 dias" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((lojaNum) => {
                      const data = vendas.find((v) => v.lojaNumero === lojaNum);
                      return (
                        <div key={lojaNum} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
                          <div className="text-[#555] text-xs uppercase tracking-wider mb-1">Loja {lojaNum}</div>
                          <div className="text-[#D4FF00] text-3xl font-black mb-1">{data?.totalVendas ?? 0}</div>
                          <div className="text-[#555] text-xs">vendas totais</div>
                          <div className="mt-2 text-white text-sm font-bold">{data?.totalQuantidade ?? 0} unidades</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "sem-estoque" && (
              <div>
                <p className="text-[#555] text-sm mb-3">{semEstoque?.length ?? 0} produto{semEstoque?.length !== 1 ? "s" : ""} sem estoque em nenhuma loja</p>
                {!semEstoque || semEstoque.length === 0 ? (
                  <EmptyState label="Todos os produtos tem estoque disponivel" success />
                ) : (
                  <Table headers={["Produto", "Preco Venda", "Status"]}>
                    {semEstoque.map((p) => (
                      <tr key={p.id} className="border-b border-[#0f0f0f] last:border-0 hover:bg-[#111]">
                        <td className="px-4 py-3">
                          <div className="text-white text-sm font-medium">{p.modelo}</div>
                          <div className="text-[#555] text-xs">{p.marca} &middot; {p.cor}</div>
                        </td>
                        <td className="px-4 py-3 text-[#D4FF00] text-sm font-bold">
                          R$ {Number(p.precoVenda).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1a0a0a] text-red-400 uppercase">
                            sem estoque
                          </span>
                        </td>
                      </tr>
                    ))}
                  </Table>
                )}
              </div>
            )}

            {tab === "valor" && (
              <div>
                <p className="text-[#555] text-sm mb-3">Valor total do estoque por loja (preco de venda)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {[1, 2, 3].map((lojaNum) => {
                    const data = valorLoja?.find((v) => v.lojaNumero === lojaNum);
                    return (
                      <div key={lojaNum} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
                        <div className="text-[#555] text-xs uppercase tracking-wider mb-1">Loja {lojaNum}</div>
                        <div className="text-[#D4FF00] text-2xl font-black mb-1">
                          R$ {(data?.valorTotal ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[#555] text-xs">{data?.quantidadeTotal ?? 0} unidades</div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-[#0d0d0d] border border-[#D4FF00]/20 rounded-xl p-4">
                  <div className="text-[#555] text-xs uppercase tracking-wider mb-1">Total geral</div>
                  <div className="text-white text-3xl font-black">
                    R$ {(valorLoja?.reduce((s, v) => s + v.valorTotal, 0) ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1a1a1a]">
            {headers.map((h) => (
              <th key={h} className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EmptyState({ label, success }: { label: string; success?: boolean }) {
  return (
    <div className={`border rounded-xl p-8 text-center ${success ? "bg-[#0a1a0a] border-[#44ff88]/20" : "bg-[#0d0d0d] border-[#1a1a1a]"}`}>
      <p className={`text-sm ${success ? "text-[#44ff88]" : "text-[#555]"}`}>{label}</p>
    </div>
  );
}

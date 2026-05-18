import AdminLayout from "@/components/AdminLayout";
import {
  useGetDashboardStats,
  getGetDashboardStatsQueryKey,
  useGetEstoqueBaixo,
  getGetEstoqueBaixoQueryKey,
} from "@workspace/api-client-react";
import { Smartphone, Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Link } from "wouter";

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: any; accent?: boolean }) {
  return (
    <div className={`bg-[#0d0d0d] border rounded-xl p-4 ${accent ? "border-[#D4FF00]/30" : "border-[#1a1a1a]"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#555] text-xs uppercase tracking-wider font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? "bg-[#D4FF00]" : "bg-[#111]"}`}>
          <Icon size={15} className={accent ? "text-black" : "text-[#555]"} />
        </div>
      </div>
      <div className={`text-3xl font-black ${accent ? "text-[#D4FF00]" : "text-white"}`}>{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });
  const { data: alertas, isLoading: loadingAlertas } = useGetEstoqueBaixo({
    query: { queryKey: getGetEstoqueBaixoQueryKey() },
  });

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-white font-black text-2xl">Dashboard</h1>
          <p className="text-[#555] text-sm mt-0.5">Visao geral do estoque</p>
        </div>

        {loadingStats ? (
          <div className="flex items-center gap-2 text-[#555] py-8">
            <div className="w-5 h-5 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
            Carregando...
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            <StatCard label="Produtos" value={stats?.totalProdutos ?? 0} icon={Smartphone} accent />
            <StatCard label="Itens em Estoque" value={stats?.totalItensEmEstoque ?? 0} icon={Package} />
            <StatCard label="Alertas Baixo" value={stats?.alertasEstoqueBaixo ?? 0} icon={AlertTriangle} />
            <StatCard label="Entradas Hoje" value={stats?.entradasHoje ?? 0} icon={ArrowDownToLine} />
            <StatCard label="Saidas Hoje" value={stats?.saidasHoje ?? 0} icon={ArrowUpFromLine} />
          </div>
        )}

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Acoes rapidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/admin/produtos/novo">
              <button className="w-full bg-[#D4FF00] text-black font-bold py-3 px-4 rounded-xl text-sm hover:opacity-90 transition-opacity">
                + Novo Produto
              </button>
            </Link>
            <Link href="/admin/entrada">
              <button className="w-full bg-[#111] border border-[#222] text-white font-bold py-3 px-4 rounded-xl text-sm hover:border-[#D4FF00]/30 transition-colors">
                Entrada
              </button>
            </Link>
            <Link href="/admin/saida">
              <button className="w-full bg-[#111] border border-[#222] text-white font-bold py-3 px-4 rounded-xl text-sm hover:border-[#D4FF00]/30 transition-colors">
                Saida
              </button>
            </Link>
            <Link href="/admin/relatorios">
              <button className="w-full bg-[#111] border border-[#222] text-white font-bold py-3 px-4 rounded-xl text-sm hover:border-[#D4FF00]/30 transition-colors">
                Relatorios
              </button>
            </Link>
          </div>
        </div>

        {/* Low stock alerts */}
        <div>
          <h2 className="text-white font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={14} className="text-[#ffaa00]" />
            Alertas de Estoque Baixo
            {alertas && alertas.length > 0 && (
              <span className="bg-[#ffaa00] text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                {alertas.length}
              </span>
            )}
          </h2>
          {loadingAlertas ? (
            <div className="text-[#555] text-sm">Carregando...</div>
          ) : !alertas || alertas.length === 0 ? (
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6 text-center">
              <p className="text-[#555] text-sm">Nenhum alerta de estoque baixo</p>
            </div>
          ) : (
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium">Produto</th>
                    <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium">Loja</th>
                    <th className="text-left text-[#555] text-xs uppercase tracking-wider px-4 py-3 font-medium">Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.map((a, i) => (
                    <tr key={i} className="border-b border-[#0f0f0f] last:border-0 hover:bg-[#111]">
                      <td className="px-4 py-3">
                        <div className="text-white text-sm font-medium">{a.modelo}</div>
                        <div className="text-[#555] text-xs">{a.marca}</div>
                      </td>
                      <td className="px-4 py-3 text-[#999] text-sm">Loja {a.lojaNumero}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${a.quantidade === 0 ? "text-red-400" : "text-[#ffaa00]"}`}>
                          {a.quantidade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

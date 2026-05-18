import { useState } from "react";
import { Link } from "wouter";
import {
  useListProdutos,
  getListProdutosQueryKey,
  useGetConfigLojas,
  getGetConfigLojasQueryKey,
  type ListProdutosParams,
} from "@workspace/api-client-react";
import { Search, SlidersHorizontal, Smartphone, Download } from "lucide-react";

const MARCAS = ["Apple", "Samsung", "Xiaomi", "Motorola", "LG", "OnePlus"];
const ORDENAR_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor_estoque", label: "Menor estoque" },
  { value: "preco_asc", label: "Menor preco" },
  { value: "preco_desc", label: "Maior preco" },
] as const;

type OrdOptions = "recentes" | "menor_estoque" | "preco_asc" | "preco_desc";

function ProductImage({ imagemFile, imagemUrl, modelo }: { imagemFile?: string | null; imagemUrl?: string | null; modelo: string }) {
  const src = imagemFile
    ? `/api/uploads/produtos/${imagemFile}`
    : imagemUrl || null;

  if (!src) {
    return (
      <div className="w-full h-36 bg-[#111] rounded-lg flex items-center justify-center">
        <Smartphone size={48} className="text-[#2a2a2a]" />
      </div>
    );
  }

  return (
    <div className="w-full h-36 rounded-lg overflow-hidden bg-[#111]">
      <img
        src={src}
        alt={modelo}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg></div>`;
          }
        }}
      />
    </div>
  );
}

export default function Vitrine() {
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [loja, setLoja] = useState<number | undefined>();
  const [ordenar, setOrdenar] = useState<OrdOptions>("recentes");
  const [chegouHoje, setChegouHoje] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  async function handleBackup() {
    setBackupLoading(true);
    try {
      const res = await fetch("/api/backup", { method: "POST" });
      if (!res.ok) throw new Error("Falha");
      alert("Backup salvo!");
    } catch {
      alert("Erro ao gerar backup.");
    } finally {
      setBackupLoading(false);
    }
  }

  const params: ListProdutosParams = {
    modelo: modelo || undefined,
    marca: marca || undefined,
    precoMin: precoMin ? Number(precoMin) : undefined,
    precoMax: precoMax ? Number(precoMax) : undefined,
    loja,
    ordenar,
    chegaram_hoje: chegouHoje || undefined,
  };

  const { data: produtos, isLoading } = useListProdutos(params, {
    query: { queryKey: getListProdutosQueryKey(params) },
  });

  const { data: configLojas } = useGetConfigLojas({
    query: { queryKey: getGetConfigLojasQueryKey() },
  });

  const lojaLabel = (num: number) => {
    const conf = configLojas?.find((c) => c.lojaNumero === num);
    return conf?.nomeLoja?.trim() ? conf.nomeLoja : `L${num}`;
  };

  const lojaLabelFull = (num: number) => {
    const conf = configLojas?.find((c) => c.lojaNumero === num);
    return conf?.nomeLoja?.trim() ? conf.nomeLoja : `Loja ${num}`;
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#080808] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D4FF00] rounded-lg flex items-center justify-center shrink-0">
              <Smartphone size={18} className="text-black" />
            </div>
            <div>
              <div className="text-white font-black text-lg leading-tight tracking-tight">INFINITYPHONE</div>
              <div className="text-[#D4FF00] text-[9px] font-bold tracking-[0.2em] uppercase">Assistencia Tecnica e Acessorios</div>
            </div>
          </div>
          <Link href="/admin">
            <button className="text-[#555] hover:text-white text-xs transition-colors px-3 py-1.5 rounded border border-[#222] hover:border-[#444]">
              Admin
            </button>
          </Link>
        </div>

        {/* Search bar */}
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <input
                type="text"
                placeholder="Buscar modelo..."
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="w-full bg-[#111] border border-[#222] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4FF00] transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                showFilters ? "bg-[#D4FF00] text-black border-[#D4FF00]" : "bg-[#111] text-[#999] border-[#222] hover:text-white hover:border-[#444]"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filtros
            </button>
            <button
              onClick={handleBackup}
              disabled={backupLoading}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all bg-[#111] text-[#999] border-[#222] hover:text-white hover:border-[#444] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              {backupLoading ? "Gerando..." : "Backup"}
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 p-4 bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[#666] text-xs mb-1 block">Marca</label>
                <select
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4FF00]"
                >
                  <option value="">Todas</option>
                  {MARCAS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#666] text-xs mb-1 block">Loja</label>
                <select
                  value={loja ?? ""}
                  onChange={(e) => setLoja(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4FF00]"
                >
                  <option value="">Todas</option>
                  <option value="1">{lojaLabelFull(1)}</option>
                  <option value="2">{lojaLabelFull(2)}</option>
                  <option value="3">{lojaLabelFull(3)}</option>
                </select>
              </div>
              <div>
                <label className="text-[#666] text-xs mb-1 block">Preco min</label>
                <input
                  type="number"
                  placeholder="R$ 0"
                  value={precoMin}
                  onChange={(e) => setPrecoMin(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4FF00]"
                />
              </div>
              <div>
                <label className="text-[#666] text-xs mb-1 block">Preco max</label>
                <input
                  type="number"
                  placeholder="R$ 9999"
                  value={precoMax}
                  onChange={(e) => setPrecoMax(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4FF00]"
                />
              </div>
              <div className="col-span-2 md:col-span-4 flex items-center gap-4 flex-wrap">
                <div>
                  <label className="text-[#666] text-xs mb-1 block">Ordenar por</label>
                  <select
                    value={ordenar}
                    onChange={(e) => setOrdenar(e.target.value as OrdOptions)}
                    className="bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4FF00]"
                  >
                    {ORDENAR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setChegouHoje(!chegouHoje)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      chegouHoje ? "bg-[#D4FF00] text-black border-[#D4FF00]" : "bg-[#111] text-[#999] border-[#222]"
                    }`}
                  >
                    Chegaram Hoje
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !produtos || produtos.length === 0 ? (
          <div className="text-center py-20">
            <Smartphone size={48} className="text-[#333] mx-auto mb-4" />
            <p className="text-[#555] text-lg">Nenhum produto encontrado</p>
          </div>
        ) : (
          <>
            <p className="text-[#555] text-sm mb-4">{produtos.length} produto{produtos.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#D4FF00]/30 transition-all group"
                >
                  {/* Image */}
                  <div className="relative mb-3">
                    <ProductImage imagemFile={produto.imagemFile} imagemUrl={produto.imagemUrl} modelo={produto.modelo} />
                    {produto.chegouHoje && (
                      <span className="absolute top-2 left-2 bg-[#D4FF00] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                        Chegou Hoje
                      </span>
                    )}
                    <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                      produto.statusNovoUsado === "novo"
                        ? "bg-[#1a2a0a] text-[#7dff00] border border-[#3a5a0a]"
                        : "bg-[#2a1a0a] text-[#ffaa00] border border-[#5a3a0a]"
                    }`}>
                      {produto.statusNovoUsado}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="mb-3">
                    <div className="text-[#666] text-xs font-medium uppercase tracking-wider mb-0.5">{produto.marca}</div>
                    <div className="text-white font-bold text-sm leading-tight">{produto.modelo}</div>
                    <div className="text-[#555] text-xs mt-1">
                      {produto.cor} &middot; {produto.armazenamentoGb}GB &middot; {produto.ramGb}GB RAM
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-[#D4FF00] font-black text-xl mb-3">
                    R$ {produto.precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>

                  {/* Stock per store */}
                  <div className="border-t border-[#1a1a1a] pt-3">
                    <div className="text-[#555] text-[10px] uppercase tracking-wider mb-1.5">Estoque por loja</div>
                    <div className="flex gap-1 flex-wrap">
                      {produto.estoquePorLoja.map((e) => (
                        <div
                          key={e.lojaNumero}
                          title={lojaLabelFull(e.lojaNumero)}
                          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded ${
                            e.quantidade === 0
                              ? "bg-[#1a0a0a] text-[#ff4444]"
                              : e.quantidade <= 2
                              ? "bg-[#2a1a0a] text-[#ffaa00]"
                              : "bg-[#0a1a0a] text-[#44ff88]"
                          }`}
                        >
                          {lojaLabel(e.lojaNumero)}: {e.quantidade}
                        </div>
                      ))}
                      <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-[#111] text-[#999]">
                        Total: {produto.estoqueTotal}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

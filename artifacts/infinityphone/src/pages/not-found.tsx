import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
      <div>
        <div className="text-[#D4FF00] text-8xl font-black mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Pagina nao encontrada</h1>
        <p className="text-[#999] mb-6">A pagina que voce procura nao existe.</p>
        <Link href="/">
          <button className="bg-[#D4FF00] text-black font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
            Voltar para Vitrine
          </button>
        </Link>
      </div>
    </div>
  );
}

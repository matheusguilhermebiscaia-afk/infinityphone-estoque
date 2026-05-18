import { Link, useLocation } from "wouter";
import { useAdminLogout, getGetAuthStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Smartphone,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Smartphone },
  { href: "/admin/entrada", label: "Entrada", icon: ArrowDownToLine },
  { href: "/admin/saida", label: "Saida", icon: ArrowUpFromLine },
  { href: "/admin/historico", label: "Historico", icon: History },
  { href: "/admin/relatorios", label: "Relatorios", icon: BarChart3 },
  { href: "/admin/configuracoes", label: "Configuracoes", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();
  const logout = useAdminLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAuthStatusQueryKey() });
        navigate("/admin/login");
      },
    },
  });

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1a1a1a]">
        <div className="w-8 h-8 bg-[#D4FF00] rounded flex items-center justify-center">
          <Smartphone size={16} className="text-black" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">INFINITYPHONE</div>
          <div className="text-[#D4FF00] text-[10px] font-medium tracking-wider uppercase">Admin</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/admin" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${
                  active
                    ? "bg-[#D4FF00] text-black"
                    : "text-[#999] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4">
        <Link href="/">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#999] hover:text-white hover:bg-white/5 cursor-pointer transition-all mb-1">
            <Smartphone size={16} />
            Ver Vitrine
          </div>
        </Link>
        <button
          onClick={() => logout.mutate({})}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#999] hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 flex-col bg-[#0a0a0a] border-r border-[#1a1a1a] fixed h-full z-20">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-56 bg-[#0a0a0a] border-r border-[#1a1a1a]">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-[#1a1a1a] sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#D4FF00] rounded flex items-center justify-center">
              <Smartphone size={14} className="text-black" />
            </div>
            <span className="text-white font-bold text-sm">INFINITYPHONE</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

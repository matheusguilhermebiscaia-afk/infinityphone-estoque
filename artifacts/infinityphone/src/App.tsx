import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useGetAuthStatus } from "@workspace/api-client-react";
import Vitrine from "@/pages/Vitrine";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProdutos from "@/pages/AdminProdutos";
import AdminProdutoNovo from "@/pages/AdminProdutoNovo";
import AdminEntrada from "@/pages/AdminEntrada";
import AdminSaida from "@/pages/AdminSaida";
import AdminHistorico from "@/pages/AdminHistorico";
import AdminRelatorios from "@/pages/AdminRelatorios";
import AdminConfiguracoes from "@/pages/AdminConfiguracoes";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: auth, isLoading } = useGetAuthStatus();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !auth?.authenticated) {
      navigate("/admin/login");
    }
  }, [isLoading, auth?.authenticated, navigate]);

  if (isLoading || !auth?.authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Vitrine} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>
      <Route path="/admin/produtos">
        <AdminGuard><AdminProdutos /></AdminGuard>
      </Route>
      <Route path="/admin/produtos/novo">
        <AdminGuard><AdminProdutoNovo /></AdminGuard>
      </Route>
      <Route path="/admin/produtos/:id/editar">
        <AdminGuard><AdminProdutoNovo /></AdminGuard>
      </Route>
      <Route path="/admin/entrada">
        <AdminGuard><AdminEntrada /></AdminGuard>
      </Route>
      <Route path="/admin/saida">
        <AdminGuard><AdminSaida /></AdminGuard>
      </Route>
      <Route path="/admin/historico">
        <AdminGuard><AdminHistorico /></AdminGuard>
      </Route>
      <Route path="/admin/relatorios">
        <AdminGuard><AdminRelatorios /></AdminGuard>
      </Route>
      <Route path="/admin/configuracoes">
        <AdminGuard><AdminConfiguracoes /></AdminGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;

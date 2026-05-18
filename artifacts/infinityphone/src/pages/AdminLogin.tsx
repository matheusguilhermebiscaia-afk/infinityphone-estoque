import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin, getGetAuthStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Smartphone, User, Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const login = useAdminLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAuthStatusQueryKey() });
        navigate("/admin");
      },
      onError: () => {
        setError(
          "Usuario ou senha incorretos. Se nao definiu as variaveis de ambiente, use usuario: admin / senha: infinityphone2024"
        );
        setPassword("");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username) { setError("Digite o usuario."); return; }
    if (!password) { setError("Digite a senha."); return; }
    login.mutate({ data: { username, password } });
  };

  const inputCls =
    "w-full bg-[#111] border border-[#222] rounded-lg px-3 py-3 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4FF00] transition-colors";

  return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#D4FF00] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone size={32} className="text-black" />
          </div>
          <h1 className="text-white font-black text-2xl tracking-tight">INFINITYPHONE</h1>
          <p className="text-[#D4FF00] text-xs font-bold tracking-[0.2em] uppercase mt-1">Painel Admin</p>
        </div>

        {/* Card */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="text-[#666] text-xs font-medium mb-1.5 block uppercase tracking-wider">
                Usuario
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Digite seu usuario"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  className={inputCls + " pl-9"}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-[#666] text-xs font-medium mb-1.5 block uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={inputCls + " pl-9 pr-9"}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#999] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-[#D4FF00] text-black font-black py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm tracking-wide mt-2"
            >
              {login.isPending ? "Entrando..." : "Entrar"}
            </button>

            {/* Error */}
            {error && (
              <div className="bg-[#1a0a0a] border border-red-900/50 rounded-lg px-4 py-3 text-red-400 text-xs leading-relaxed">
                {error}
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-[#333] text-xs mt-5 leading-relaxed">
          Usuario padrao: <span className="text-[#555]">admin</span>
          {" · "}
          Senha padrao: <span className="text-[#555]">infinityphone2024</span>
        </p>
      </div>
    </div>
  );
}

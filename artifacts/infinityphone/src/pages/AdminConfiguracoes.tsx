import { useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useGetConfigLojas,
  getGetConfigLojasQueryKey,
  useUpdateConfigLojas,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Settings, CheckCircle } from "lucide-react";
import { useState } from "react";
import { silentBackup } from "@/lib/backup";

type FormData = {
  loja1Nome: string; loja1End: string; loja1Tel: string;
  loja2Nome: string; loja2End: string; loja2Tel: string;
  loja3Nome: string; loja3End: string; loja3Tel: string;
};

export default function AdminConfiguracoes() {
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  const { data: configLojas, isLoading } = useGetConfigLojas({
    query: { queryKey: getGetConfigLojasQueryKey() },
  });

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      loja1Nome: "", loja1End: "", loja1Tel: "",
      loja2Nome: "", loja2End: "", loja2Tel: "",
      loja3Nome: "", loja3End: "", loja3Tel: "",
    },
  });

  useEffect(() => {
    if (configLojas) {
      const l = (n: number) => configLojas.find((c) => c.lojaNumero === n);
      reset({
        loja1Nome: l(1)?.nomeLoja ?? "", loja1End: l(1)?.endereco ?? "", loja1Tel: l(1)?.telefone ?? "",
        loja2Nome: l(2)?.nomeLoja ?? "", loja2End: l(2)?.endereco ?? "", loja2Tel: l(2)?.telefone ?? "",
        loja3Nome: l(3)?.nomeLoja ?? "", loja3End: l(3)?.endereco ?? "", loja3Tel: l(3)?.telefone ?? "",
      });
    }
  }, [configLojas, reset]);

  const update = useUpdateConfigLojas({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConfigLojasQueryKey() });
        silentBackup();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    },
  });

  const onSubmit = (data: FormData) => {
    update.mutate({
      data: {
        lojas: [
          { lojaNumero: 1, nomeLoja: data.loja1Nome, endereco: data.loja1End, telefone: data.loja1Tel },
          { lojaNumero: 2, nomeLoja: data.loja2Nome, endereco: data.loja2End, telefone: data.loja2Tel },
          { lojaNumero: 3, nomeLoja: data.loja3Nome, endereco: data.loja3End, telefone: data.loja3Tel },
        ],
      },
    });
  };

  const inputCls = "w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4FF00]/50 transition-colors";

  const LojaSection = ({
    num, nomeKey, endKey, telKey,
  }: {
    num: number;
    nomeKey: keyof FormData;
    endKey: keyof FormData;
    telKey: keyof FormData;
  }) => (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-[#D4FF00] rounded-lg flex items-center justify-center">
          <span className="text-black font-black text-xs">{num}</span>
        </div>
        <h3 className="text-white font-bold">Loja {num}</h3>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-[#666] text-xs font-medium mb-1 block uppercase tracking-wider">Nome da Loja</label>
          <input
            {...register(nomeKey)}
            placeholder={`Ex: INFINITYPHONE Loja ${num}`}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-[#666] text-xs font-medium mb-1 block uppercase tracking-wider">Endereco</label>
          <input
            {...register(endKey)}
            placeholder="Rua, numero, bairro, cidade"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-[#666] text-xs font-medium mb-1 block uppercase tracking-wider">Telefone</label>
          <input
            {...register(telKey)}
            placeholder="(11) 99999-9999"
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[#111] rounded-lg flex items-center justify-center">
            <Settings size={16} className="text-[#D4FF00]" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">Configuracoes</h1>
            <p className="text-[#555] text-sm">Nome e dados de contato das lojas</p>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 bg-[#0a1a0a] border border-[#44ff88]/30 rounded-xl px-4 py-3 mb-4">
            <CheckCircle size={15} className="text-[#44ff88]" />
            <span className="text-[#44ff88] text-sm font-medium">Configuracoes salvas com sucesso!</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-[#555] py-8">
            <div className="w-5 h-5 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
            Carregando...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <LojaSection num={1} nomeKey="loja1Nome" endKey="loja1End" telKey="loja1Tel" />
            <LojaSection num={2} nomeKey="loja2Nome" endKey="loja2End" telKey="loja2Tel" />
            <LojaSection num={3} nomeKey="loja3Nome" endKey="loja3End" telKey="loja3Tel" />

            <button
              type="submit"
              disabled={update.isPending}
              className="w-full bg-[#D4FF00] text-black font-black py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {update.isPending ? "Salvando..." : "Salvar Configuracoes"}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

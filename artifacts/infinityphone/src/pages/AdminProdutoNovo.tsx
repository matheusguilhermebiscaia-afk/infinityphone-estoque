import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useLocation, useParams } from "wouter";
import {
  useCreateProduto,
  useUpdateProduto,
  useGetProduto,
  getGetProdutoQueryKey,
  getListProdutosQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ArrowLeft, Upload, Image as ImageIcon, X } from "lucide-react";
import { silentBackup } from "@/lib/backup";

type FormData = {
  modelo: string;
  marca: string;
  cor: string;
  armazenamentoGb: number;
  ramGb: number;
  precoCusto: number;
  precoVenda: number;
  statusNovoUsado: "novo" | "usado";
  imagemUrl: string;
};

export default function AdminProdutoNovo() {
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const editId = params.id ? Number(params.id) : undefined;
  const isEdit = !!editId;
  const queryClient = useQueryClient();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existing } = useGetProduto(editId!, {
    query: { enabled: isEdit, queryKey: getGetProdutoQueryKey(editId!) },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      modelo: "", marca: "", cor: "",
      armazenamentoGb: 128, ramGb: 6,
      precoCusto: 0, precoVenda: 0,
      statusNovoUsado: "novo",
      imagemUrl: "",
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        modelo: existing.modelo,
        marca: existing.marca,
        cor: existing.cor,
        armazenamentoGb: existing.armazenamentoGb,
        ramGb: existing.ramGb,
        precoCusto: existing.precoCusto,
        precoVenda: existing.precoVenda,
        statusNovoUsado: existing.statusNovoUsado,
        imagemUrl: existing.imagemUrl ?? "",
      });
      if (existing.imagemFile) {
        setImagePreview(`/api/uploads/produtos/${existing.imagemFile}`);
      } else if (existing.imagemUrl) {
        setImagePreview(existing.imagemUrl);
      }
    }
  }, [existing, reset]);

  const uploadImage = async (produtoId: number) => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("imagem", imageFile);
    const res = await fetch(`/api/produtos/${produtoId}/upload-imagem`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      setUploadError(err.error || "Erro ao enviar imagem");
    }
  };

  const createProduto = useCreateProduto({
    mutation: {
      onSuccess: async (data) => {
        await uploadImage(data.id);
        queryClient.invalidateQueries({ queryKey: getListProdutosQueryKey() });
        silentBackup();
        navigate("/admin/produtos");
      },
    },
  });

  const updateProduto = useUpdateProduto({
    mutation: {
      onSuccess: async (data) => {
        await uploadImage(data.id);
        queryClient.invalidateQueries({ queryKey: getListProdutosQueryKey() });
        if (editId) queryClient.invalidateQueries({ queryKey: getGetProdutoQueryKey(editId) });
        silentBackup();
        navigate("/admin/produtos");
      },
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      armazenamentoGb: Number(data.armazenamentoGb),
      ramGb: Number(data.ramGb),
      precoCusto: Number(data.precoCusto),
      precoVenda: Number(data.precoVenda),
      imagemUrl: data.imagemUrl || undefined,
    };
    if (isEdit && editId) {
      updateProduto.mutate({ id: editId, data: payload });
    } else {
      createProduto.mutate({ data: payload });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError("Arquivo muito grande. Maximo 5MB."); return; }
    setUploadError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isPending = createProduto.isPending || updateProduto.isPending;

  const inputCls = "w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4FF00]/50 transition-colors";

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="text-[#666] text-xs font-medium mb-1.5 block uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/admin/produtos")} className="w-8 h-8 rounded-lg bg-[#111] text-[#555] hover:text-white flex items-center justify-center transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-white font-black text-2xl">{isEdit ? "Editar Produto" : "Novo Produto"}</h1>
            <p className="text-[#555] text-sm">{isEdit ? "Atualizar dados do produto" : "Cadastrar novo celular"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">Dados do Produto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Modelo" error={errors.modelo?.message}>
                <input {...register("modelo", { required: "Obrigatorio" })} placeholder="iPhone 14 Pro" className={inputCls} />
              </Field>
              <Field label="Marca" error={errors.marca?.message}>
                <input {...register("marca", { required: "Obrigatorio" })} placeholder="Apple" className={inputCls} />
              </Field>
              <Field label="Cor" error={errors.cor?.message}>
                <input {...register("cor", { required: "Obrigatorio" })} placeholder="Preto" className={inputCls} />
              </Field>
              <Field label="Status">
                <select {...register("statusNovoUsado")} className={inputCls}>
                  <option value="novo">Novo</option>
                  <option value="usado">Usado</option>
                </select>
              </Field>
              <Field label="Armazenamento (GB)">
                <select {...register("armazenamentoGb")} className={inputCls}>
                  <option value="64">64 GB</option>
                  <option value="128">128 GB</option>
                  <option value="256">256 GB</option>
                  <option value="512">512 GB</option>
                  <option value="1024">1 TB</option>
                </select>
              </Field>
              <Field label="RAM (GB)">
                <select {...register("ramGb")} className={inputCls}>
                  <option value="3">3 GB</option>
                  <option value="4">4 GB</option>
                  <option value="6">6 GB</option>
                  <option value="8">8 GB</option>
                  <option value="12">12 GB</option>
                  <option value="16">16 GB</option>
                </select>
              </Field>
              <Field label="Preco de Custo (R$)" error={errors.precoCusto?.message}>
                <input type="number" step="0.01" {...register("precoCusto", { required: "Obrigatorio", min: 0 })} placeholder="0.00" className={inputCls} />
              </Field>
              <Field label="Preco de Venda (R$)" error={errors.precoVenda?.message}>
                <input type="number" step="0.01" {...register("precoVenda", { required: "Obrigatorio", min: 0 })} placeholder="0.00" className={inputCls} />
              </Field>
            </div>
          </div>

          {/* Image section */}
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <ImageIcon size={14} className="text-[#D4FF00]" />
              Imagem do Aparelho
            </h2>

            {/* Preview */}
            {imagePreview && (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-[#2a2a2a] group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview(null)} />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            )}

            {/* File upload */}
            <div>
              <label className="text-[#666] text-xs font-medium mb-1.5 block uppercase tracking-wider">Enviar Arquivo (JPG/PNG, max 5MB)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3 bg-[#111] border border-dashed border-[#333] rounded-lg cursor-pointer hover:border-[#D4FF00]/50 transition-colors"
              >
                <Upload size={16} className="text-[#555]" />
                <div>
                  <div className="text-[#999] text-sm">{imageFile ? imageFile.name : "Clique para selecionar imagem"}</div>
                  <div className="text-[#444] text-xs mt-0.5">JPG, PNG ou WebP ate 5MB</div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
            </div>

            {/* URL input */}
            <div>
              <label className="text-[#666] text-xs font-medium mb-1.5 block uppercase tracking-wider">
                URL da Imagem
                <span className="text-[#444] normal-case tracking-normal font-normal ml-2">(alternativa ao upload)</span>
              </label>
              <input
                {...register("imagemUrl")}
                placeholder="https://..."
                className={inputCls}
                onChange={(e) => {
                  if (!imageFile && e.target.value) setImagePreview(e.target.value);
                  else if (!e.target.value) setImagePreview(null);
                }}
              />
              <p className="text-[#444] text-xs mt-1">
                Ex: Cole a URL da imagem do produto no site Casas Bahia, Magazine Luiza, etc.
                Ex: https://a-static.mlcdn.com.br/800x560/celular-samsung...
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/admin/produtos")} className="flex-1 bg-[#111] border border-[#222] text-[#999] font-medium py-3 rounded-xl text-sm hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 bg-[#D4FF00] text-black font-black py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {isPending ? "Salvando..." : isEdit ? "Salvar Alteracoes" : "Cadastrar Produto"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

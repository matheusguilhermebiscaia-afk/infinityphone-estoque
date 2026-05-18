# INFINITYPHONE ESTOQUE

Sistema completo de controle de estoque de celulares com vitrine digital para 3 lojas.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Express 5 + express-session
- **Banco de dados:** PostgreSQL + Drizzle ORM
- **Linguagem:** TypeScript 5.9
- **Gerenciador de pacotes:** pnpm (workspaces monorepo)

---

## Como rodar localmente

### 1. Pré-requisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL (local ou remoto, ex: Neon, Supabase)

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/nome_do_banco
SESSION_SECRET=uma-string-aleatoria-longa
ADMIN_PASSWORD=infinityphone2024
ADMIN_USERNAME=admin
```

Para adicionar mais usuários admin:
```env
ADMIN_USERNAME_2=LOJA
ADMIN_PASSWORD_2=1234
```

### 4. Criar tabelas no banco

```bash
pnpm --filter @workspace/db run push
```

Ou use o arquivo `schema.sql` incluído neste pacote:

```bash
psql $DATABASE_URL < schema.sql
```

### 5. Rodar em desenvolvimento

Em dois terminais separados:

```bash
# Terminal 1 — API (porta 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (porta 23771)
pnpm --filter @workspace/infinityphone run dev
```

Acesse: http://localhost:23771

---

## Credenciais padrão

- **Usuário:** `admin`
- **Senha:** `infinityphone2024`

---

## Estrutura do projeto

```
├── artifacts/
│   ├── api-server/          # Backend Express
│   │   └── src/routes/      # auth, produtos, estoque, movimentacoes, relatorios, backup
│   └── infinityphone/       # Frontend React + Vite
│       └── src/pages/       # Vitrine, Admin*, AdminLogin
├── lib/
│   ├── api-spec/            # OpenAPI spec (fonte da verdade)
│   ├── api-client-react/    # Hooks gerados pelo Orval
│   ├── api-zod/             # Schemas Zod gerados
│   └── db/                  # Schema Drizzle ORM
└── schema.sql               # Schema SQL para recriar o banco
```

---

## Build para produção

```bash
pnpm run build
```

---

## Funcionalidades

- **Vitrine pública** (`/`): grade de produtos com estoque por loja, filtros e busca
- **Admin** (`/admin`): dashboard com alertas de estoque baixo
- **Produtos** (`/admin/produtos`): CRUD completo com upload de imagem
- **Entrada/Saída** (`/admin/entrada`, `/admin/saida`): movimentação de estoque
- **Histórico** (`/admin/historico`): log de movimentações com filtros
- **Relatórios** (`/admin/relatorios`): entradas, vendas, sem estoque, valor por loja
- **Configurações** (`/admin/configuracoes`): nome, endereço e telefone das lojas
- **Backup automático**: gerado a cada salvamento, mantém os 10 mais recentes em `/backups/`

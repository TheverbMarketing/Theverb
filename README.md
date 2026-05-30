# The Verb — Plataforma de Linhas Editoriais

SaaS para a agência **The Verb** gerenciar clientes e criar linhas editoriais
(planejamentos mensais de conteúdo), entregues ao cliente por um link público
e dinâmico. Estética preto & branco, minimalista e editorial.

**Stack:** Next.js 15 (App Router) · React 19 · Supabase (Postgres + Auth) ·
Tailwind CSS · shadcn/ui · TipTap.

---

## 1. Pré-requisitos

- Node.js 18.18+ (recomendado 20+)
- Uma conta no [Supabase](https://supabase.com)

## 2. Configurar o Supabase

1. Crie um projeto novo no Supabase.
2. Vá em **SQL Editor** e cole/rode o conteúdo de `supabase/schema.sql`.
   Isso cria as tabelas (`clients`, `editorial_lines`, `posts`), enums,
   RLS, triggers e a função pública `get_public_editorial`.
3. Crie o usuário admin: **Authentication → Users → Add user**
   (informe e-mail e senha). Em dev, você pode desativar a confirmação de
   e-mail em **Authentication → Providers → Email**.
4. Pegue as chaves em **Project Settings → API**:
   - `Project URL`
   - `anon public` key

## 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

## 4. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` → você será redirecionada para `/login`.
Entre com o usuário admin criado no passo 2.

---

## Fluxo de uso

1. **Clientes** → cadastre um cliente (nome, nicho, contato).
2. Abra o cliente → **Nova linha editorial** (ex: "Maio / 2026").
3. Abra a linha editorial → adicione **Conteúdos** (formato, data, roteiro
   no editor rico).
4. Mude o status para **Publicado** e **copie o link** do cliente.
5. O cliente acessa `/view/[hash]` — uma página read-only e responsiva.

> Apenas linhas com status `published` aparecem no link público. A função
> `get_public_editorial` (SECURITY DEFINER) expõe somente os campos
> necessários — sem vazar `owner_id`, rascunhos ou outros clientes.

---

## Arquitetura de pastas

```
app/
  (auth)/login/         → login + server actions de auth
  (dashboard)/          → área privada (guard no layout + middleware)
    dashboard/          → visão geral
    clients/            → CRUD de clientes
      [clientId]/       → detalhe + linhas editoriais
    editorials/
      [editorialId]/    → gestão de posts (editor TipTap)
  view/[hash]/          → 👁 visão pública do cliente (read-only)
components/
  ui/                   → shadcn/ui (B&W)
  dashboard/            → componentes do admin
  public/               → componentes da visão do cliente
  shared/               → compartilhados
lib/
  supabase/             → clients browser/server + middleware
  tiptap/               → extensões compartilhadas editor/renderer
types/                  → tipos do domínio
supabase/schema.sql     → schema completo do banco
```

## Decisões técnicas

- **Conteúdo em JSONB** (output nativo do TipTap), não HTML cru — renderizado
  no servidor com `generateHTML` usando as mesmas extensões do editor.
- **`public_hash`** opaco e URL-safe separado do UUID interno — nada de PKs
  na URL pública.
- **RLS dupla camada**: admin via `owner_id = auth.uid()`; público via RPC
  controlada, sem policy `anon` aberta nas tabelas.
- **ISR** (`revalidate = 60`) na visão pública para performance + atualização.

## Gerar tipos do Supabase (opcional)

```bash
npx supabase gen types typescript --project-id SEU_ID > types/database.ts
```

---

© The Verb

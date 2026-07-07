// Tipos do domínio. Em produção, gere automaticamente com:
//   npx supabase gen types typescript --project-id SEU_ID > types/database.ts

export type EditorialStatus = "draft" | "published" | "archived";
export type PostType = "reels" | "carousel" | "single_post" | "story";

export interface Client {
  id: string;
  owner_id: string;
  name: string;
  niche: string | null;
  contact: string | null;
  created_at: string;
  updated_at: string;
}

export interface EditorialLine {
  id: string;
  client_id: string;
  owner_id: string;
  name: string;
  status: EditorialStatus;
  public_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  editorial_line_id: string;
  owner_id: string;
  title: string | null;
  type: PostType;
  scheduled_date: string | null;
  content: TiptapContent | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Links internos do post (referências + artes no Drive).
// Ficam guardados DENTRO do jsonb `content` (chave `meta`), então
// nenhuma alteração de backend/schema é necessária. O TipTap ignora
// chaves desconhecidas ao renderizar, e a página pública nunca exibe.
export interface PostLinksMeta {
  referenceLinks?: string[];
  driveLinks?: string[];
}

// JSON do TipTap (alias simplificado de JSONContent)
export type TiptapContent = {
  type?: string;
  content?: TiptapContent[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  attrs?: Record<string, unknown>;
  // chave extra usada apenas pelo app (não é renderizada pelo TipTap)
  meta?: PostLinksMeta;
};

// Helper: extrai os links do content de forma segura
export function getPostLinks(content: TiptapContent | null): {
  referenceLinks: string[];
  driveLinks: string[];
} {
  return {
    referenceLinks: content?.meta?.referenceLinks?.filter(Boolean) ?? [],
    driveLinks: content?.meta?.driveLinks?.filter(Boolean) ?? [],
  };
}

// Retorno da RPC pública
export interface PublicEditorial {
  id: string;
  name: string;
  client_name: string;
  client_niche: string | null;
  status: EditorialStatus;
  posts: {
    id: string;
    title: string | null;
    type: PostType;
    scheduled_date: string | null;
    content: TiptapContent | null;
  }[];
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  reels: "Reels",
  carousel: "Carrossel",
  single_post: "Post Único",
  story: "Story",
};

export const STATUS_LABELS: Record<EditorialStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

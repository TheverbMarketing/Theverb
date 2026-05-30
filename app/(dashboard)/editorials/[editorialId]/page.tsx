import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PublishControls } from "@/components/dashboard/publish-controls";
import { PostEditor } from "@/components/dashboard/post-editor";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { TypeBadge } from "@/components/shared/type-badge";
import { RichTextRenderer } from "@/components/public/rich-text-renderer";
import { deletePost } from "./posts-actions";
import { formatDate } from "@/lib/utils";
import type { EditorialLine, Post, Client } from "@/types/database";

export default async function EditorialDetailPage({
  params,
}: {
  params: Promise<{ editorialId: string }>;
}) {
  const { editorialId } = await params;
  const supabase = await createClient();

  const { data: editorial } = await supabase
    .from("editorial_lines")
    .select("*, clients(id, name)")
    .eq("id", editorialId)
    .single();

  if (!editorial) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("editorial_line_id", editorialId)
    .order("sort_order", { ascending: true })
    .order("scheduled_date", { ascending: true });

  const line = editorial as EditorialLine & { clients: Pick<Client, "id" | "name"> };
  const list = (posts ?? []) as Post[];

  return (
    <div className="animate-fade-up">
      <Link
        href={`/clients/${line.clients.id}`}
        className="mb-10 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {line.clients.name}
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-3">
          Linha editorial
        </p>
        <h1 className="font-serif text-5xl">{line.name}</h1>
      </header>

      <div className="mb-12">
        <PublishControls
          editorialId={line.id}
          status={line.status}
          publicHash={line.public_hash}
        />
      </div>

      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-serif text-2xl">
          Conteúdos
          <span className="ml-3 text-base text-neutral-400">{list.length}</span>
        </h2>
        <PostEditor editorialLineId={line.id} />
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 py-20 text-center">
          <p className="font-serif text-xl">Nenhum conteúdo ainda</p>
          <p className="mt-2 text-sm text-neutral-500">
            Adicione o primeiro post deste planejamento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((post, i) => (
            <article
              key={post.id}
              className="group rounded-xl border border-neutral-200 p-7 transition-colors hover:border-neutral-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="font-serif text-sm text-neutral-300 pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex items-center gap-3">
                      <TypeBadge type={post.type} />
                      {post.scheduled_date && (
                        <span className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                          {formatDate(post.scheduled_date)}
                        </span>
                      )}
                    </div>
                    {post.title && (
                      <h3 className="mt-3 font-serif text-2xl leading-tight">
                        {post.title}
                      </h3>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <PostEditor
                    editorialLineId={line.id}
                    post={post}
                    mode="edit"
                  />
                  <DeleteButton
                    onDelete={async () => {
                      "use server";
                      await deletePost(post.id, line.id);
                    }}
                    title="Excluir conteúdo"
                    description="Este post será removido permanentemente."
                  />
                </div>
              </div>

              <div className="mt-5 border-t border-neutral-100 pt-5 pl-8">
                <RichTextRenderer
                  content={post.content}
                  className="prose-sm line-clamp-4"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

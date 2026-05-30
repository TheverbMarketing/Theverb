import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/public/post-card";
import type { PublicEditorial } from "@/types/database";

// ISR — revalida a cada 60s; alterações do admin aparecem rápido sem rebuild.
export const revalidate = 60;

async function getEditorial(hash: string): Promise<PublicEditorial | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_editorial", {
    p_hash: hash,
  });
  if (error || !data) return null;
  return data as PublicEditorial;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hash: string }>;
}): Promise<Metadata> {
  const { hash } = await params;
  const editorial = await getEditorial(hash);
  if (!editorial) return { title: "Linha Editorial — The Verb" };
  return {
    title: `${editorial.name} · ${editorial.client_name} — The Verb`,
    description: `Planejamento editorial de ${editorial.client_name}.`,
    robots: { index: false, follow: false }, // link privado, fora dos buscadores
  };
}

export default async function PublicEditorialPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const editorial = await getEditorial(hash);

  if (!editorial) notFound();

  return (
    <main className="min-h-screen bg-white">
      {/* ─── Cabeçalho / Hero ─── */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-neutral-400">
            The Verb · Linha Editorial
          </p>

          <h1 className="mb-6 font-serif text-5xl leading-[1.05] text-neutral-900 md:text-7xl">
            {editorial.name}
          </h1>

          <div className="flex items-center gap-3 text-neutral-500">
            <span className="text-lg">{editorial.client_name}</span>
            {editorial.client_niche && (
              <>
                <span className="h-1 w-1 rounded-full bg-neutral-300" />
                <span className="text-sm">{editorial.client_niche}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Feed de conteúdos ─── */}
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {editorial.posts.length === 0 ? (
          <p className="py-20 text-center font-serif text-xl text-neutral-400">
            Nenhum conteúdo publicado ainda.
          </p>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {editorial.posts.map((post, i) => (
              <div key={post.id} className="animate-fade-up opacity-0" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}>
                <PostCard post={post} index={i} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Rodapé ─── */}
      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="mb-2 font-serif text-2xl text-neutral-900">The Verb</p>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Estratégia &amp; Conteúdo
          </p>
        </div>
      </footer>
    </main>
  );
}

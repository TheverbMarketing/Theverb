import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { EditorialForm } from "@/components/dashboard/editorial-form";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { deleteEditorial } from "@/app/(dashboard)/editorials/actions";
import { formatDateShort } from "@/lib/utils";
import {
  STATUS_LABELS,
  type Client,
  type EditorialLine,
} from "@/types/database";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) notFound();

  const { data: editorials } = await supabase
    .from("editorial_lines")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  const c = client as Client;
  const lines = (editorials ?? []) as EditorialLine[];

  return (
    <div className="animate-fade-up">
      <Link
        href="/clients"
        className="mb-10 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Clientes
      </Link>

      <header className="mb-12 border-b border-neutral-200 pb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-3">
          Cliente
        </p>
        <h1 className="font-serif text-5xl">{c.name}</h1>
        <div className="mt-4 flex items-center gap-3 text-neutral-500">
          {c.niche && <span>{c.niche}</span>}
          {c.niche && c.contact && (
            <span className="h-1 w-1 rounded-full bg-neutral-300" />
          )}
          {c.contact && <span>{c.contact}</span>}
        </div>
      </header>

      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-serif text-2xl">Linhas editoriais</h2>
        <EditorialForm clientId={clientId} />
      </div>

      {lines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 py-20 text-center">
          <p className="font-serif text-xl">Nenhum planejamento ainda</p>
          <p className="mt-2 text-sm text-neutral-500">
            Crie a primeira linha editorial deste cliente.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lines.map((line) => (
            <div
              key={line.id}
              className="group flex flex-col rounded-xl border border-neutral-200 p-7 transition-colors hover:border-neutral-400"
            >
              <div className="mb-6 flex items-start justify-between">
                <Badge
                  variant={line.status === "published" ? "default" : "outline"}
                >
                  {STATUS_LABELS[line.status]}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <EditorialForm
                    clientId={clientId}
                    editorial={line}
                    mode="edit"
                  />
                  <DeleteButton
                    onDelete={async () => {
                      "use server";
                      await deleteEditorial(line.id, clientId);
                    }}
                    title="Excluir linha editorial"
                    description="Todos os posts vinculados também serão removidos."
                  />
                </div>
              </div>

              <Link href={`/editorials/${line.id}`} className="flex-1">
                <h3 className="font-serif text-2xl leading-tight transition-colors group-hover:text-neutral-900">
                  {line.name}
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-neutral-400">
                  Criada em {formatDateShort(line.created_at)}
                </p>
              </Link>

              <Link
                href={`/editorials/${line.id}`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
              >
                Gerenciar conteúdos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

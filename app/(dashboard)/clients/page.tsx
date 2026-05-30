import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClientForm } from "@/components/dashboard/client-form";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { deleteClientRecord } from "./actions";
import type { Client } from "@/types/database";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (clients ?? []) as Client[];

  return (
    <div className="animate-fade-up">
      <header className="mb-12 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-3">
            Carteira
          </p>
          <h1 className="font-serif text-4xl">Clientes</h1>
        </div>
        <ClientForm />
      </header>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 py-24 text-center">
          <p className="font-serif text-2xl text-neutral-900">
            Nenhum cliente ainda
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Cadastre o primeiro cliente para começar.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          {list.map((client, i) => (
            <div
              key={client.id}
              className={`group flex items-center gap-6 px-8 py-6 transition-colors hover:bg-neutral-50 ${
                i !== 0 ? "border-t border-neutral-100" : ""
              }`}
            >
              <span className="font-serif text-sm text-neutral-300 w-8">
                {String(i + 1).padStart(2, "0")}
              </span>

              <Link href={`/clients/${client.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl truncate">{client.name}</h2>
                  <ArrowUpRight className="h-4 w-4 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm text-neutral-500">
                  {client.niche && <span>{client.niche}</span>}
                  {client.niche && client.contact && (
                    <span className="h-1 w-1 rounded-full bg-neutral-300" />
                  )}
                  {client.contact && (
                    <span className="truncate">{client.contact}</span>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <ClientForm client={client} mode="edit" />
                <DeleteButton
                  onDelete={async () => {
                    "use server";
                    await deleteClientRecord(client.id);
                  }}
                  title="Excluir cliente"
                  description="Todas as linhas editoriais e posts vinculados também serão removidos."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

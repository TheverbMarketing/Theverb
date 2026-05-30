import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Users, FileText, Send } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: clientsCount }, { count: editorialsCount }, { count: publishedCount }] =
    await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("editorial_lines").select("*", { count: "exact", head: true }),
      supabase
        .from("editorial_lines")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
    ]);

  const stats = [
    { label: "Clientes", value: clientsCount ?? 0, icon: Users, href: "/clients" },
    { label: "Linhas editoriais", value: editorialsCount ?? 0, icon: FileText, href: "/clients" },
    { label: "Publicadas", value: publishedCount ?? 0, icon: Send, href: "/clients" },
  ];

  return (
    <div className="animate-fade-up">
      <header className="mb-14">
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-3">
          Visão geral
        </p>
        <h1 className="font-serif text-4xl">Bem-vinda de volta.</h1>
        <p className="mt-3 text-neutral-500">
          Acompanhe seus clientes e planejamentos em um só lugar.
        </p>
      </header>

      <div className="grid gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col justify-between bg-white p-8 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                {label}
              </span>
              <Icon className="h-4 w-4 text-neutral-300 transition-colors group-hover:text-neutral-900" />
            </div>
            <span className="mt-10 font-serif text-5xl">{value}</span>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-neutral-200 p-10 text-center">
        <h2 className="font-serif text-2xl">Comece por aqui</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Cadastre um cliente e crie a primeira linha editorial.
        </p>
        <Link
          href="/clients"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Ir para Clientes
        </Link>
      </div>
    </div>
  );
}

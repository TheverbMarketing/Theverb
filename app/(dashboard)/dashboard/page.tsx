import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Users,
  FileText,
  Send,
  CalendarClock,
  Flame,
  Hourglass,
  CalendarX2,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TypeBadge } from "@/components/shared/type-badge";
import {
  OverviewCalendar,
  type CalendarPost,
} from "@/components/dashboard/overview-calendar";
import type { PostType } from "@/types/database";

// Linha crua vinda do Supabase (join posts -> editorial_lines -> clients)
interface PostRow {
  id: string;
  title: string | null;
  type: PostType;
  scheduled_date: string | null;
  editorial_line_id: string;
  editorial_lines: {
    id: string;
    name: string;
    clients: { name: string } | null;
  } | null;
}

function todaySaoPaulo(): string {
  // YYYY-MM-DD no fuso de São Paulo (en-CA formata como ISO)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

function diffInDays(from: string, to: string): number {
  // datas YYYY-MM-DD → parse como UTC meia-noite, diferença exata em dias
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

function formatDayLabel(diff: number): string {
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  return `Em ${diff} dias`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = todaySaoPaulo();

  const [
    { count: clientsCount },
    { count: editorialsCount },
    { count: publishedCount },
    { data: scheduledPosts },
    { count: noDateCount },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("editorial_lines").select("*", { count: "exact", head: true }),
    supabase
      .from("editorial_lines")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("posts")
      .select(
        "id, title, type, scheduled_date, editorial_line_id, editorial_lines(id, name, clients(name))"
      )
      .not("scheduled_date", "is", null)
      .order("scheduled_date", { ascending: true }),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .is("scheduled_date", null),
  ]);

  const rows = (scheduledPosts ?? []) as unknown as PostRow[];

  const calendarPosts: CalendarPost[] = rows
    .filter((r) => r.scheduled_date)
    .map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      scheduled_date: r.scheduled_date as string,
      editorialId: r.editorial_lines?.id ?? r.editorial_line_id,
      editorialName: r.editorial_lines?.name ?? "Linha editorial",
      clientName: r.editorial_lines?.clients?.name ?? "—",
    }));

  // ─── KPIs de conteúdo ───
  const withDiff = calendarPosts.map((p) => ({
    ...p,
    diff: diffInDays(today, p.scheduled_date),
  }));

  const dueToday = withDiff.filter((p) => p.diff === 0);
  const next7 = withDiff.filter((p) => p.diff >= 1 && p.diff <= 7);
  const pending = withDiff.filter((p) => p.diff >= 0); // hoje + futuros
  const upcoming = pending.slice(0, 8); // já vem ordenado por data

  const kpis = [
    {
      label: "No dia (hoje)",
      value: dueToday.length,
      icon: Flame,
      accent: "text-emerald-600",
      chip: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      bar: "bg-emerald-500",
    },
    {
      label: "Chegando perto (7 dias)",
      value: next7.length,
      icon: CalendarClock,
      accent: "text-amber-600",
      chip: "bg-amber-50 text-amber-600 ring-amber-100",
      bar: "bg-amber-500",
    },
    {
      label: "Pendentes (agendados)",
      value: pending.length,
      icon: Hourglass,
      accent: "text-blue-600",
      chip: "bg-blue-50 text-blue-600 ring-blue-100",
      bar: "bg-blue-500",
    },
    {
      label: "Sem data definida",
      value: noDateCount ?? 0,
      icon: CalendarX2,
      accent: "text-neutral-500",
      chip: "bg-neutral-100 text-neutral-500 ring-neutral-200",
      bar: "bg-neutral-300",
    },
  ];

  const generalStats = [
    { label: "Clientes", value: clientsCount ?? 0, icon: Users, href: "/clients" },
    { label: "Linhas editoriais", value: editorialsCount ?? 0, icon: FileText, href: "/clients" },
    { label: "Publicadas", value: publishedCount ?? 0, icon: Send, href: "/clients" },
  ];

  return (
    <div className="animate-fade-up">
      <header className="mb-12">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-neutral-400">
          Visão geral
        </p>
        <h1 className="font-serif text-4xl">Bem-vinda de volta.</h1>
        <p className="mt-3 text-neutral-500">
          Acompanhe seus clientes, o calendário e os próximos posts em um só lugar.
        </p>
      </header>

      {/* ─── KPIs de produção ─── */}
      <section className="mb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon, accent, chip, bar }) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-6"
            >
              <span className={cn("absolute inset-x-0 top-0 h-1", bar)} />
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.15em] text-neutral-400">
                  {label}
                </span>
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full ring-1",
                    chip
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <span className={cn("mt-6 block font-serif text-5xl", accent)}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Calendário + posts do dia ─── */}
      <section className="mb-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-2xl">Calendário de posts</h2>
          <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
            Clique num dia para ver os conteúdos
          </p>
        </div>
        <OverviewCalendar posts={calendarPosts} today={today} />
      </section>

      {/* ─── Próximos posts ─── */}
      <section className="mb-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-2xl">
            Próximos posts
            <span className="ml-3 text-base text-neutral-400">
              {pending.length}
            </span>
          </h2>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 py-16 text-center">
            <p className="font-serif text-xl">Nada agendado por enquanto</p>
            <p className="mt-2 text-sm text-neutral-500">
              Defina datas nos conteúdos das linhas editoriais para vê-los aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            {upcoming.map((post, i) => {
              const urgency =
                post.diff === 0
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : post.diff <= 3
                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                  : "bg-neutral-100 text-neutral-500 ring-neutral-200";

              return (
                <Link
                  key={post.id}
                  href={`/editorials/${post.editorialId}#post-${post.id}`}
                  className={cn(
                    "group flex items-center gap-4 bg-white px-5 py-4 transition-colors hover:bg-neutral-50",
                    i > 0 && "border-t border-neutral-100"
                  )}
                >
                  <span
                    className={cn(
                      "w-24 shrink-0 rounded-full px-3 py-1 text-center text-[10px] font-medium uppercase tracking-[0.1em] ring-1",
                      urgency
                    )}
                  >
                    {formatDayLabel(post.diff)}
                  </span>

                  <span className="w-16 shrink-0 text-xs tabular-nums text-neutral-400">
                    {post.scheduled_date.split("-").reverse().slice(0, 2).join("/")}
                  </span>

                  <TypeBadge type={post.type} />

                  <span className="min-w-0 flex-1 truncate font-serif text-lg">
                    {post.title ?? "Sem título"}
                  </span>

                  <span className="hidden max-w-[220px] truncate text-xs text-neutral-400 md:block">
                    {post.clientName} · {post.editorialName}
                  </span>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-900" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Estatísticas gerais ─── */}
      <section>
        <h2 className="mb-5 font-serif text-2xl">Geral</h2>
        <div className="grid gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 sm:grid-cols-3">
          {generalStats.map(({ label, value, icon: Icon, href }) => (
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
      </section>
    </div>
  );
}

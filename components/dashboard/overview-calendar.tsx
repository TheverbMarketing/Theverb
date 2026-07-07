"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CalendarDays,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TypeBadge } from "@/components/shared/type-badge";
import type { PostType } from "@/types/database";

export interface CalendarPost {
  id: string;
  title: string | null;
  type: PostType;
  scheduled_date: string; // YYYY-MM-DD
  editorialId: string;
  editorialName: string;
  clientName: string;
}

interface OverviewCalendarProps {
  posts: CalendarPost[];
  today: string; // YYYY-MM-DD (fuso de São Paulo, calculado no servidor)
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function toKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function OverviewCalendar({ posts, today }: OverviewCalendarProps) {
  const [ty, tm] = today.split("-").map(Number);
  const [viewYear, setViewYear] = useState(ty);
  const [viewMonth, setViewMonth] = useState(tm - 1); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Agrupa posts por data
  const byDate = useMemo(() => {
    const map = new Map<string, CalendarPost[]>();
    for (const p of posts) {
      const list = map.get(p.scheduled_date) ?? [];
      list.push(p);
      map.set(p.scheduled_date, list);
    }
    return map;
  }, [posts]);

  function prevMonth() {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  function goToday() {
    setViewYear(ty);
    setViewMonth(tm - 1);
    setSelectedDay(today);
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Sempre 6 semanas (42 células) → o calendário NUNCA muda de altura
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length < 42) cells.push(null);

  const monthCount = Array.from(byDate.entries()).filter(([key]) =>
    key.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`)
  ).reduce((acc, [, list]) => acc + list.length, 0);

  const selectedPosts = selectedDay ? byDate.get(selectedDay) ?? [] : [];
  const selectedLabel = selectedDay
    ? (() => {
        const [sy, sm, sd] = selectedDay.split("-").map(Number);
        return `${String(sd).padStart(2, "0")} de ${MONTHS[sm - 1]} de ${sy}`;
      })()
    : "";

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {/* ─── Cabeçalho ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4 md:px-7">
        <div className="flex items-baseline gap-3">
          <h3 className="font-serif text-2xl md:text-3xl">
            {MONTHS[viewMonth]}{" "}
            <span className="text-neutral-400">{viewYear}</span>
          </h3>
          <span className="text-xs uppercase tracking-[0.15em] text-neutral-400">
            {monthCount} {monthCount === 1 ? "post" : "posts"} no mês
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={goToday}
            className="mr-1 rounded-md border border-neutral-200 px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
          >
            Hoje
          </button>
          <button
            onClick={prevMonth}
            aria-label="Mês anterior"
            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Próximo mês"
            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ─── Dias da semana ─── */}
      <div className="grid grid-cols-7 border-b border-neutral-100 bg-neutral-50/60">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="py-2.5 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-400"
          >
            {d}
          </span>
        ))}
      </div>

      {/* ─── Grade do mês (altura fixa: 6 semanas sempre) ─── */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) {
            return (
              <div
                key={`empty-${i}`}
                className={cn(
                  "h-24 border-neutral-100 bg-neutral-50/40 md:h-32",
                  i % 7 !== 0 && "border-l",
                  i >= 7 && "border-t"
                )}
              />
            );
          }

          const key = toKey(viewYear, viewMonth, day);
          const dayPosts = byDate.get(key) ?? [];
          const isToday = key === today;
          const isSelected = key === selectedDay;
          const isPast = key < today;

          return (
            <button
              key={key}
              onClick={() =>
                setSelectedDay((cur) => (cur === key ? null : key))
              }
              className={cn(
                "flex h-24 flex-col items-stretch gap-1 overflow-hidden border-neutral-100 p-1.5 text-left transition-colors md:h-32 md:p-2",
                i % 7 !== 0 && "border-l",
                i >= 7 && "border-t",
                isSelected
                  ? "bg-neutral-900"
                  : isToday
                  ? "bg-emerald-50/70 hover:bg-emerald-50"
                  : "hover:bg-neutral-50"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums md:text-sm",
                  isSelected
                    ? "bg-white font-medium text-neutral-900"
                    : isToday
                    ? "bg-emerald-600 font-medium text-white"
                    : isPast
                    ? "text-neutral-300"
                    : "text-neutral-600"
                )}
              >
                {day}
              </span>

              {/* Chips dos posts dentro da célula */}
              <span className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                {dayPosts.slice(0, 3).map((p, idx) => {
                  const hidden = idx === 2 && dayPosts.length > 3;
                  if (hidden) {
                    return (
                      <span
                        key="more"
                        className={cn(
                          "truncate rounded px-1.5 py-0.5 text-[10px] font-medium",
                          isSelected
                            ? "text-neutral-300"
                            : "text-neutral-400"
                        )}
                      >
                        +{dayPosts.length - 2} posts
                      </span>
                    );
                  }
                  return (
                    <span
                      key={p.id}
                      className={cn(
                        "hidden truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight md:block",
                        isSelected
                          ? "bg-white/15 text-white"
                          : isToday
                          ? "bg-emerald-100 text-emerald-800"
                          : isPast
                          ? "bg-neutral-100 text-neutral-400"
                          : "bg-blue-50 text-blue-700"
                      )}
                    >
                      {p.title ?? "Sem título"}
                    </span>
                  );
                })}

                {/* No mobile, só bolinhas */}
                {dayPosts.length > 0 && (
                  <span className="mt-auto flex gap-0.5 md:hidden">
                    {dayPosts.slice(0, 4).map((p) => (
                      <span
                        key={p.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isSelected
                            ? "bg-white"
                            : isToday
                            ? "bg-emerald-500"
                            : isPast
                            ? "bg-neutral-300"
                            : "bg-blue-500"
                        )}
                      />
                    ))}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Painel do dia selecionado (altura fixa, com scroll interno) ─── */}
      <div className="border-t border-neutral-100">
        {selectedDay === null ? (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-neutral-400">
            <CalendarDays className="h-4 w-4" />
            Clique num dia para ver os conteúdos programados.
          </div>
        ) : (
          <div className="flex h-56 flex-col">
            <div className="flex items-center justify-between px-5 pb-2 pt-4 md:px-7">
              <div className="flex items-baseline gap-3">
                <h4 className="font-serif text-lg">{selectedLabel}</h4>
                <span className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                  {selectedPosts.length}{" "}
                  {selectedPosts.length === 1 ? "post" : "posts"}
                </span>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                aria-label="Fechar"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 md:px-7">
              {selectedPosts.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">
                  Nenhum post programado para este dia.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/editorials/${post.editorialId}#post-${post.id}`}
                      className="group flex items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3.5 transition-colors hover:border-neutral-900"
                    >
                      <div className="min-w-0">
                        <div className="mb-1.5">
                          <TypeBadge type={post.type} />
                        </div>
                        <p className="truncate font-serif text-base leading-tight">
                          {post.title ?? "Sem título"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-neutral-400">
                          {post.clientName} · {post.editorialName}
                        </p>
                      </div>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-900" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

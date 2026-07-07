"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight, CalendarDays } from "lucide-react";
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
  const [selectedDay, setSelectedDay] = useState<string>(today);

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
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
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

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedPosts = byDate.get(selectedDay) ?? [];
  const [sy, sm, sd] = selectedDay.split("-").map(Number);
  const selectedLabel = `${String(sd).padStart(2, "0")} de ${MONTHS[sm - 1]} de ${sy}`;

  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 lg:grid-cols-[1.1fr_1fr]">
      {/* ─── Calendário ─── */}
      <div className="bg-white p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-serif text-xl">
            {MONTHS[viewMonth]}{" "}
            <span className="text-neutral-400">{viewYear}</span>
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={goToday}
              className="mr-1 rounded-md px-2.5 py-1 text-xs uppercase tracking-[0.1em] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              Hoje
            </button>
            <button
              onClick={prevMonth}
              aria-label="Mês anterior"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              aria-label="Próximo mês"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center">
          {WEEKDAYS.map((d) => (
            <span
              key={d}
              className="py-1 text-[10px] uppercase tracking-[0.15em] text-neutral-400"
            >
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;

            const key = toKey(viewYear, viewMonth, day);
            const dayPosts = byDate.get(key) ?? [];
            const isToday = key === today;
            const isSelected = key === selectedDay;
            const isPast = key < today;

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors",
                  isSelected
                    ? "bg-neutral-900 text-white"
                    : isToday
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-300 hover:bg-emerald-100"
                    : "text-neutral-700 hover:bg-neutral-100",
                  isPast && !isSelected && !isToday && "text-neutral-300"
                )}
              >
                {day}
                {dayPosts.length > 0 && (
                  <span className="absolute bottom-1.5 flex gap-0.5">
                    {dayPosts.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isSelected
                            ? "bg-white"
                            : key === today
                            ? "bg-emerald-500"
                            : key < today
                            ? "bg-neutral-300"
                            : "bg-blue-500"
                        )}
                      />
                    ))}
                    {dayPosts.length > 3 && (
                      <span
                        className={cn(
                          "text-[8px] leading-[6px]",
                          isSelected ? "text-white" : "text-neutral-400"
                        )}
                      >
                        +
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-neutral-100 pt-4 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Hoje
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Programado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" /> Passado
          </span>
        </div>
      </div>

      {/* ─── Posts do dia selecionado ─── */}
      <div className="flex flex-col bg-white p-6 md:p-8">
        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-400">
          {selectedDay === today ? "Hoje" : "Dia selecionado"}
        </p>
        <h3 className="mb-6 font-serif text-xl">{selectedLabel}</h3>

        {selectedPosts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <CalendarDays className="mb-3 h-6 w-6 text-neutral-200" />
            <p className="text-sm text-neutral-400">
              Nenhum post programado para este dia.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/editorials/${post.editorialId}#post-${post.id}`}
                className="group flex items-start justify-between gap-3 rounded-lg border border-neutral-200 p-4 transition-colors hover:border-neutral-900"
              >
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <TypeBadge type={post.type} />
                  </div>
                  <p className="truncate font-serif text-lg leading-tight">
                    {post.title ?? "Sem título"}
                  </p>
                  <p className="mt-1 truncate text-xs text-neutral-400">
                    {post.clientName} · {post.editorialName}
                  </p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-900" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

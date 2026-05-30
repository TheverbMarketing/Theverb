"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(auth)/login/actions";

const NAV = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutGrid },
  { href: "/clients", label: "Clientes", icon: Users },
];

export function Sidebar({ email }: { email: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white">
      {/* Logo */}
      <div className="px-8 py-9 border-b border-neutral-100">
        <span className="font-serif text-2xl">The Verb</span>
        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          Painel Editorial
        </p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 py-8">
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Usuário */}
      <div className="border-t border-neutral-100 p-4">
        <div className="px-4 py-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Conectado como
          </p>
          <p className="mt-0.5 truncate text-sm text-neutral-700">
            {email ?? "—"}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="mt-2 flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}

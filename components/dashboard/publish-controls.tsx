"use client";

import { useState, useTransition } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEditorialStatus } from "@/app/(dashboard)/editorials/actions";
import { STATUS_LABELS, type EditorialStatus } from "@/types/database";

interface PublishControlsProps {
  editorialId: string;
  status: EditorialStatus;
  publicHash: string;
}

export function PublishControls({
  editorialId,
  status,
  publicHash,
}: PublishControlsProps) {
  const [current, setCurrent] = useState<EditorialStatus>(status);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/view/${publicHash}`
      : `/view/${publicHash}`;

  function changeStatus(value: EditorialStatus) {
    setCurrent(value);
    startTransition(async () => {
      try {
        await updateEditorialStatus(editorialId, value);
        toast.success(`Status: ${STATUS_LABELS[value]}`);
      } catch {
        toast.error("Não foi possível alterar o status.");
        setCurrent(status);
      }
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copiado.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
          Status do planejamento
        </p>
        <Select
          value={current}
          onValueChange={(v) => changeStatus(v as EditorialStatus)}
          disabled={pending}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
          Link do cliente
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-md border border-neutral-200 px-4 py-2 text-sm transition-colors hover:border-neutral-400"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copiar link
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-800"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir
          </a>
        </div>
        {current !== "published" && (
          <p className="text-xs text-neutral-400">
            Publique para tornar o link acessível ao cliente.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { TiptapContent } from "@/types/database";

/** Converte o JSON do TipTap em texto puro, preservando quebras de linha. */
function tiptapToPlainText(node: TiptapContent): string {
  if (node.type === "text") return node.text ?? "";

  const children = (node.content ?? []).map(tiptapToPlainText).join("");

  switch (node.type) {
    case "paragraph":
    case "heading":
      return children + "\n";
    case "listItem":
      return "• " + children;
    case "blockquote":
      return children;
    case "hardBreak":
      return "\n";
    default:
      return children;
  }
}

interface CopyPostButtonProps {
  title: string | null;
  content: TiptapContent | null;
}

export function CopyPostButton({ title, content }: CopyPostButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const body = content ? tiptapToPlainText(content).replace(/\n{3,}/g, "\n\n").trim() : "";
    const text = [title, body].filter(Boolean).join("\n\n");

    if (!text) {
      toast.error("Este conteúdo ainda está vazio.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Conteúdo copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      aria-label="Copiar conteúdo"
      title="Copiar conteúdo"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

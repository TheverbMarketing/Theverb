import { generateHTML } from "@tiptap/html";
import { baseExtensions } from "@/lib/tiptap/extensions";
import { cn } from "@/lib/utils";
import type { TiptapContent } from "@/types/database";

interface RichTextRendererProps {
  content: TiptapContent | null;
  className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  if (!content || !content.content || content.content.length === 0) {
    return (
      <p className="text-sm italic text-neutral-400">
        Sem conteúdo escrito.
      </p>
    );
  }

  let html = "";
  try {
    // baseExtensions deve bater com as extensões usadas no editor
    html = generateHTML(content, baseExtensions);
  } catch {
    return (
      <p className="text-sm italic text-neutral-400">
        Conteúdo indisponível.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "tiptap-content prose prose-neutral max-w-none",
        "prose-headings:font-serif prose-headings:font-normal",
        "prose-p:text-neutral-700 prose-p:leading-relaxed",
        "prose-strong:text-neutral-900 prose-strong:font-semibold",
        "prose-li:text-neutral-700 prose-li:marker:text-neutral-400",
        "prose-a:text-neutral-900 prose-a:underline prose-a:underline-offset-4",
        "prose-blockquote:border-neutral-300 prose-blockquote:text-neutral-500",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

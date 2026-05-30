"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { editorExtensions } from "@/lib/tiptap/extensions";
import { cn } from "@/lib/utils";
import type { TiptapContent } from "@/types/database";

interface RichTextEditorProps {
  value: TiptapContent | null;
  onChange: (json: TiptapContent) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escreva a legenda, o roteiro, os títulos...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: editorExtensions(placeholder),
    content: value ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap tiptap-content min-h-[280px] max-w-none px-5 py-4 text-[15px] leading-relaxed text-neutral-800 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as TiptapContent),
  });

  if (!editor) return null;

  const Btn = ({
    onClick,
    active,
    disabled,
    label,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    label: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-30",
        active
          ? "bg-neutral-900 text-white"
          : "text-neutral-600 hover:bg-neutral-100"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 focus-within:border-neutral-900 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-100 bg-neutral-50/50 px-2 py-1.5">
        <Btn
          label="Negrito"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn
          label="Itálico"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn
          label="Tachado"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <Strikethrough className="h-4 w-4" />
        </Btn>

        <span className="mx-1 h-5 w-px bg-neutral-200" />

        <Btn
          label="Título"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn
          label="Subtítulo"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="h-4 w-4" />
        </Btn>

        <span className="mx-1 h-5 w-px bg-neutral-200" />

        <Btn
          label="Lista"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List className="h-4 w-4" />
        </Btn>
        <Btn
          label="Lista numerada"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn
          label="Citação"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          <Quote className="h-4 w-4" />
        </Btn>

        <span className="mx-1 h-5 w-px bg-neutral-200" />

        <Btn
          label="Desfazer"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Btn>
        <Btn
          label="Refazer"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Btn>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { Extensions } from "@tiptap/core";

// Extensões compartilhadas entre o editor (admin) e o renderer (cliente).
// Mantê-las idênticas garante que o HTML gerado bate com o que foi editado.
export const baseExtensions: Extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    bulletList: { keepMarks: true },
    orderedList: { keepMarks: true },
  }),
];

export const editorExtensions = (placeholder: string): Extensions => [
  ...baseExtensions,
  Placeholder.configure({ placeholder }),
];

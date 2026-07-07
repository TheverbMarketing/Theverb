"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import { LinkListInput } from "@/components/dashboard/link-list-input";
import { createPost, updatePost } from "@/app/(dashboard)/editorials/[editorialId]/posts-actions";
import {
  POST_TYPE_LABELS,
  getPostLinks,
  type Post,
  type PostType,
  type TiptapContent,
} from "@/types/database";

interface PostEditorProps {
  editorialLineId: string;
  post?: Post;
  mode?: "create" | "edit";
}

export function PostEditor({
  editorialLineId,
  post,
  mode = "create",
}: PostEditorProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const initialLinks = getPostLinks(post?.content ?? null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [type, setType] = useState<PostType>(post?.type ?? "single_post");
  const [date, setDate] = useState(post?.scheduled_date ?? "");
  const [content, setContent] = useState<TiptapContent | null>(
    post?.content ?? null
  );

  // Links internos (não aparecem na página pública da linha editorial)
  const [referenceLinks, setReferenceLinks] = useState<string[]>(
    initialLinks.referenceLinks
  );
  const [driveLinks, setDriveLinks] = useState<string[]>(
    initialLinks.driveLinks
  );

  function handleSave() {
    startTransition(async () => {
      try {
        // Guarda os links dentro do próprio jsonb `content` (chave `meta`),
        // sem precisar de nenhuma mudança no banco de dados.
        const cleanRefs = referenceLinks.map((l) => l.trim()).filter(Boolean);
        const cleanDrive = driveLinks.map((l) => l.trim()).filter(Boolean);

        const base: TiptapContent =
          content ?? { type: "doc", content: [] };

        const fullContent: TiptapContent = {
          ...base,
          meta: {
            referenceLinks: cleanRefs,
            driveLinks: cleanDrive,
          },
        };

        const payload = {
          title: title.trim() || null,
          type,
          scheduled_date: date || null,
          content: fullContent,
        };

        if (mode === "edit" && post) {
          await updatePost(post.id, editorialLineId, payload);
          toast.success("Conteúdo atualizado.");
        } else {
          await createPost(editorialLineId, payload);
          toast.success("Conteúdo criado.");
        }
        setOpen(false);
      } catch {
        toast.error("Algo deu errado. Tente novamente.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="ghost" size="icon" aria-label="Editar conteúdo">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" />
            Novo conteúdo
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar conteúdo" : "Novo conteúdo"}
          </DialogTitle>
          <DialogDescription>
            Defina o formato, a data e escreva o roteiro completo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={type} onValueChange={(v) => setType(v as PostType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POST_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data programada</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título / Tema</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: 3 erros que sabotam sua marca"
            />
          </div>

          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          {/* ─── Links internos (uso interno; não aparecem na linha editorial pública) ─── */}
          <div className="space-y-5 rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
              Links internos · não aparecem para o cliente
            </p>

            <LinkListInput
              label="Links de referência"
              hint="Referências criativas, benchmarks, matérias, etc."
              values={referenceLinks}
              onChange={setReferenceLinks}
            />

            <LinkListInput
              label="Arte do post (Google Drive)"
              hint="Links do Drive onde está a arte final deste post."
              placeholder="https://drive.google.com/..."
              values={driveLinks}
              onChange={setDriveLinks}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={pending}>
            {pending ? "Salvando..." : "Salvar conteúdo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

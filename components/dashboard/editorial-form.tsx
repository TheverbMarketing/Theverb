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
import {
  createEditorial,
  updateEditorial,
} from "@/app/(dashboard)/editorials/actions";
import { STATUS_LABELS, type EditorialLine } from "@/types/database";

interface EditorialFormProps {
  clientId: string;
  editorial?: EditorialLine;
  mode?: "create" | "edit";
}

export function EditorialForm({
  clientId,
  editorial,
  mode = "create",
}: EditorialFormProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(editorial?.status ?? "draft");
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    formData.set("status", status);
    startTransition(async () => {
      try {
        if (mode === "edit" && editorial) {
          await updateEditorial(editorial.id, clientId, formData);
          toast.success("Linha editorial atualizada.");
        } else {
          await createEditorial(clientId, formData);
          toast.success("Linha editorial criada.");
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
          <Button variant="ghost" size="icon" aria-label="Editar linha editorial">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" />
            Nova linha editorial
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar linha editorial" : "Nova linha editorial"}
          </DialogTitle>
          <DialogDescription>
            Um planejamento mensal de conteúdo para o cliente.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={editorial?.name}
              placeholder="Ex: Maio / 2026"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
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
            <p className="text-xs text-neutral-400">
              Apenas linhas <strong>Publicadas</strong> ficam visíveis no link público.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

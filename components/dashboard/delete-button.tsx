"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  title?: string;
  description?: string;
  label?: string;
}

export function DeleteButton({
  onDelete,
  title = "Confirmar exclusão",
  description = "Esta ação é permanente e não pode ser desfeita.",
  label = "Excluir",
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await onDelete();
        toast.success("Excluído com sucesso.");
        setOpen(false);
      } catch {
        toast.error("Não foi possível excluir.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label}>
          <Trash2 className="h-4 w-4 text-neutral-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} disabled={pending}>
            {pending ? "Excluindo..." : label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

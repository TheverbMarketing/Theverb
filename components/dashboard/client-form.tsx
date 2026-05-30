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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClientRecord, updateClientRecord } from "@/app/(dashboard)/clients/actions";
import type { Client } from "@/types/database";

interface ClientFormProps {
  client?: Client;
  mode?: "create" | "edit";
}

export function ClientForm({ client, mode = "create" }: ClientFormProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (mode === "edit" && client) {
          await updateClientRecord(client.id, formData);
          toast.success("Cliente atualizado.");
        } else {
          await createClientRecord(formData);
          toast.success("Cliente cadastrado.");
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
          <Button variant="ghost" size="icon" aria-label="Editar cliente">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
          <DialogDescription>
            Informações básicas do cliente da agência.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={client?.name}
              placeholder="Ex: Estúdio Lumière"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="niche">Nicho</Label>
            <Input
              id="niche"
              name="niche"
              defaultValue={client?.niche ?? ""}
              placeholder="Ex: Moda autoral"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contato</Label>
            <Textarea
              id="contact"
              name="contact"
              defaultValue={client?.contact ?? ""}
              placeholder="E-mail, telefone ou @"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
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

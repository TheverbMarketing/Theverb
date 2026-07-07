"use client";

import { Plus, X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LinkListInputProps {
  label: string;
  hint?: string;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
}

/**
 * Lista dinâmica de campos de link.
 * Clique no "+" para adicionar quantos links quiser; "x" remove.
 */
export function LinkListInput({
  label,
  hint,
  placeholder = "https://...",
  values,
  onChange,
}: LinkListInputProps) {
  const list = values.length === 0 ? [""] : values;

  function update(index: number, value: string) {
    const next = [...list];
    next[index] = value;
    onChange(next);
  }

  function add() {
    onChange([...list, ""]);
  }

  function remove(index: number) {
    const next = list.filter((_, i) => i !== index);
    onChange(next.length === 0 ? [""] : next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5 text-neutral-400" />
          {label}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={add}
          className="h-7 gap-1 text-xs text-neutral-500 hover:text-neutral-900"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>

      {hint && <p className="text-xs text-neutral-400">{hint}</p>}

      <div className="space-y-2">
        {list.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              type="url"
              value={value}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
              className="h-9 text-sm"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remover link"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-neutral-900 bg-neutral-900 text-white",
        outline: "border-neutral-200 text-neutral-500",
        muted: "border-transparent bg-neutral-100 text-neutral-600",
      },
    },
    defaultVariants: { variant: "outline" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

import { Badge } from "@/components/ui/badge";
import { POST_TYPE_LABELS, type PostType } from "@/types/database";

export function TypeBadge({
  type,
  variant = "outline",
}: {
  type: PostType;
  variant?: "outline" | "default" | "muted";
}) {
  return <Badge variant={variant}>{POST_TYPE_LABELS[type]}</Badge>;
}

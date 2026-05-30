import { TypeBadge } from "@/components/shared/type-badge";
import { RichTextRenderer } from "./rich-text-renderer";
import { formatDate } from "@/lib/utils";
import type { PostType, TiptapContent } from "@/types/database";

interface PostCardProps {
  post: {
    id: string;
    title: string | null;
    type: PostType;
    scheduled_date: string | null;
    content: TiptapContent | null;
  };
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const formatted = formatDate(post.scheduled_date, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <article
      className="group rounded-2xl border border-neutral-200 p-8 transition-colors hover:border-neutral-400 md:p-10"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <header className="mb-7 flex items-start justify-between gap-6">
        <div className="space-y-3">
          <span className="block font-serif text-sm text-neutral-300">
            {String(index + 1).padStart(2, "0")}
          </span>
          {post.title && (
            <h3 className="font-serif text-2xl leading-tight text-neutral-900 md:text-3xl">
              {post.title}
            </h3>
          )}
        </div>
        <TypeBadge type={post.type} />
      </header>

      {formatted && (
        <p className="mb-7 text-xs uppercase tracking-[0.2em] text-neutral-400">
          {formatted}
        </p>
      )}

      <div className="border-t border-neutral-100 pt-7">
        <RichTextRenderer content={post.content} />
      </div>
    </article>
  );
}

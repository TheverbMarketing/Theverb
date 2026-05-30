"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PostType, TiptapContent } from "@/types/database";

async function getUserOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

interface PostPayload {
  title: string | null;
  type: PostType;
  scheduled_date: string | null;
  content: TiptapContent | null;
}

export async function createPost(editorialLineId: string, payload: PostPayload) {
  const { supabase, user } = await getUserOrThrow();

  // próximo sort_order
  const { count } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("editorial_line_id", editorialLineId);

  const { error } = await supabase.from("posts").insert({
    owner_id: user.id,
    editorial_line_id: editorialLineId,
    title: payload.title,
    type: payload.type,
    scheduled_date: payload.scheduled_date,
    content: payload.content,
    sort_order: count ?? 0,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/editorials/${editorialLineId}`);
}

export async function updatePost(
  id: string,
  editorialLineId: string,
  payload: PostPayload
) {
  const { supabase } = await getUserOrThrow();

  const { error } = await supabase
    .from("posts")
    .update({
      title: payload.title,
      type: payload.type,
      scheduled_date: payload.scheduled_date,
      content: payload.content,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/editorials/${editorialLineId}`);
}

export async function deletePost(id: string, editorialLineId: string) {
  const { supabase } = await getUserOrThrow();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/editorials/${editorialLineId}`);
}

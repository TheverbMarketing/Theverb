"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EditorialStatus } from "@/types/database";

async function getUserOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createEditorial(clientId: string, formData: FormData) {
  const { supabase, user } = await getUserOrThrow();

  const { error } = await supabase.from("editorial_lines").insert({
    owner_id: user.id,
    client_id: clientId,
    name: String(formData.get("name")),
    status: (formData.get("status") as EditorialStatus) || "draft",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}`);
}

export async function updateEditorial(
  id: string,
  clientId: string,
  formData: FormData
) {
  const { supabase } = await getUserOrThrow();

  const { error } = await supabase
    .from("editorial_lines")
    .update({
      name: String(formData.get("name")),
      status: formData.get("status") as EditorialStatus,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/editorials/${id}`);
}

export async function updateEditorialStatus(id: string, status: EditorialStatus) {
  const { supabase } = await getUserOrThrow();
  const { error } = await supabase
    .from("editorial_lines")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/editorials/${id}`);
}

export async function deleteEditorial(id: string, clientId: string) {
  const { supabase } = await getUserOrThrow();
  const { error } = await supabase
    .from("editorial_lines")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}`);
}

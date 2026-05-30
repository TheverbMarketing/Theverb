"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getUserOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createClientRecord(formData: FormData) {
  const { supabase, user } = await getUserOrThrow();

  const { error } = await supabase.from("clients").insert({
    owner_id: user.id,
    name: String(formData.get("name")),
    niche: (formData.get("niche") as string) || null,
    contact: (formData.get("contact") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}

export async function updateClientRecord(id: string, formData: FormData) {
  const { supabase } = await getUserOrThrow();

  const { error } = await supabase
    .from("clients")
    .update({
      name: String(formData.get("name")),
      niche: (formData.get("niche") as string) || null,
      contact: (formData.get("contact") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}

export async function deleteClientRecord(id: string) {
  const { supabase } = await getUserOrThrow();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}

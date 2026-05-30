import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guard server-side (camada extra além do middleware)
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-white">
      <div className="sticky top-0 h-screen">
        <Sidebar email={user.email ?? null} />
      </div>
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-10 py-12">{children}</div>
      </main>
    </div>
  );
}

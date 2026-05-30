import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Lado esquerdo — branding */}
      <section className="hidden lg:flex flex-col justify-between bg-neutral-950 text-white p-16">
        <span className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          The Verb
        </span>
        <div>
          <h1 className="font-serif text-6xl leading-[1.05] mb-6">
            Estratégia
            <br />
            &amp; Conteúdo
          </h1>
          <p className="text-neutral-400 max-w-sm leading-relaxed">
            Planejamento editorial refinado, entregue com a elegância que a sua
            marca merece.
          </p>
        </div>
        <span className="text-xs text-neutral-600">
          © {new Date().getFullYear()} The Verb · Painel Administrativo
        </span>
      </section>

      {/* Lado direito — formulário */}
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-12 lg:hidden">
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">
              The Verb
            </span>
          </div>

          <h2 className="font-serif text-3xl mb-2">Acessar painel</h2>
          <p className="text-sm text-neutral-500 mb-10">
            Entre com suas credenciais de administrador.
          </p>

          {error && (
            <div className="mb-6 rounded-md border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {error}
            </div>
          )}

          <form action={login} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="voce@theverb.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Entrar
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}

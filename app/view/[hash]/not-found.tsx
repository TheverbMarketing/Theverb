import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="mb-6 text-xs uppercase tracking-[0.3em] text-neutral-400">
        The Verb
      </p>
      <h1 className="font-serif text-5xl text-neutral-900">Não encontrado</h1>
      <p className="mt-4 max-w-sm text-neutral-500">
        Este planejamento não existe ou ainda não foi publicado pela agência.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm text-neutral-900 underline underline-offset-4"
      >
        Voltar
      </Link>
    </main>
  );
}

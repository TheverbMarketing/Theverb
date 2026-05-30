import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="font-serif text-6xl text-neutral-900">404</h1>
      <p className="mt-4 text-neutral-500">Página não encontrada.</p>
      <Link
        href="/"
        className="mt-8 text-sm text-neutral-900 underline underline-offset-4"
      >
        Voltar ao início
      </Link>
    </main>
  );
}

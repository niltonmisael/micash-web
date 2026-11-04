import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = { title: "Termos de Uso" };

// TODO(launch): publish the final legal text before going live.
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" aria-label="MiCash, página inicial">
        <Logo />
      </Link>
      <h1 className="text-ink mt-12 text-4xl font-bold tracking-tight">Termos de Uso</h1>
      <p className="text-muted mt-6 text-lg leading-relaxed">
        O texto completo está em elaboração e será publicado aqui antes do lançamento.
      </p>
    </main>
  );
}

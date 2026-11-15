import { IconTools } from "@tabler/icons-react";
import { PageHeader } from "./app-shell";
import { Card } from "@/components/ui/misc";

/** Screens planned for the next phases of the web app. */
export function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="mt-8 flex flex-col items-center px-6 py-20 text-center">
        <span className="bg-brand-100 text-brand-700 grid size-20 place-items-center rounded-3xl">
          <IconTools size="2.25rem" aria-hidden />
        </span>
        <h2 className="text-ink mt-6 text-xl font-bold">Em breve na versão web</h2>
        <p className="text-muted mt-2 max-w-md text-base">
          Esta tela ainda está sendo construída. Enquanto isso, ela já está disponível no app MiCash.
        </p>
      </Card>
    </>
  );
}

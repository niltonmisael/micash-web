import type { Metadata } from "next";
import { Suspense } from "react";
import { Goals } from "./goals";

export const metadata: Metadata = { title: "Metas" };

export default function GoalsPage() {
  return (
    <Suspense>
      <Goals />
    </Suspense>
  );
}

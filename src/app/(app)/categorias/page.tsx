import type { Metadata } from "next";
import { Categories } from "./categories";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriesPage() {
  return <Categories />;
}

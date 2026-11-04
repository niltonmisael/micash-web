import type { Metadata } from "next";
import { Assistant } from "./assistant";

export const metadata: Metadata = { title: "Mi Assistente" };

export default function AssistantPage() {
  return <Assistant />;
}

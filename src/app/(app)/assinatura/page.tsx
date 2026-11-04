import type { Metadata } from "next";
import { Subscription } from "./subscription";

export const metadata: Metadata = { title: "Assinatura" };

export default function SubscriptionPage() {
  return <Subscription />;
}

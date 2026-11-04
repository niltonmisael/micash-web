import type { Metadata } from "next";
import { Transactions } from "./transactions";

export const metadata: Metadata = { title: "Transações" };

export default function TransactionsPage() {
  return <Transactions />;
}

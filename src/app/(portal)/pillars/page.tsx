import type { Metadata } from "next";
import { PillarsView } from "@/features/pillars/PillarsView";

export const metadata: Metadata = { title: "Clinical Pillars" };

export default function PillarsPage() {
  return <PillarsView />;
}

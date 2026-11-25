import type { Metadata } from "next";
import { SafetyView } from "@/features/safety/SafetyView";

export const metadata: Metadata = { title: "Safety & Safeguards" };

export default function SafetyPage() {
  return <SafetyView />;
}

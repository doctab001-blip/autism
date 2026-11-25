import type { Metadata } from "next";
import { EnvironmentView } from "@/features/environment/EnvironmentView";

export const metadata: Metadata = { title: "Home Environment" };

export default function EnvironmentPage() {
  return <EnvironmentView />;
}

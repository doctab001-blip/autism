import type { Metadata } from "next";
import { TrackerView } from "@/features/tracker/TrackerView";

export const metadata: Metadata = { title: "ABC Behavior Tracker" };

export default function TrackerPage() {
  return <TrackerView />;
}

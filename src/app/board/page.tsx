import type { Metadata } from "next";
import { BoardView } from "@/features/board/BoardView";

export const metadata: Metadata = {
  title: "Child Board: First–Then & Stars",
  description: "A calm, full-screen First–Then and 5-star token board for tablets.",
};

export default function BoardPage() {
  return <BoardView />;
}

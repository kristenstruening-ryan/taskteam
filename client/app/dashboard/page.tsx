"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import type { BoardSummary } from "../../shared/types";

export default function DashboardPage() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);

  useEffect(() => {
    api
      .get("/boards")
      .then((res) => setBoards(res.data))
      .catch((err) => console.error("Could not load boards", err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Boards</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/board/${board.id}`}
            className="p-6 border rounded-xl shadow-sm hover:shadow-md transition bg-white"
          >
            <h2 className="text-xl font-semibold text-blue-600">
              {board.title}
            </h2>
            <p className="text-gray-500 text-sm mt-2">Click to view tasks</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

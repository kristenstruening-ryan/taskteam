"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("Preparing to join...");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current || !token) return;

    const processInvite = async () => {
      hasProcessed.current = true;
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("Please log in to join this board...");
        setTimeout(() => {
          router.push(`/login?callback=/invite?token=${token}`);
        }, 1500);
        return;
      }

      try {
        setStatus("Verifying invite...");
        const verifyRes = await api.get(`/invites/verify/${token}`);
        const { boardName } = verifyRes.data.invite;

        setStatus(`You've been invited to join "${boardName}"!`);

        const res = await api.post("/invites/accept", { token: token });

        setStatus("Success! Joining workspace...");
        router.push(`/boards/${res.data.boardId}`);
      } catch (err: unknown) {
        let errorMessage = "This invite link is invalid or expired.";

        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || errorMessage;
        }

        setStatus(errorMessage);
      }
    };

    processInvite();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-sm w-full">
        <div className="text-4xl mb-6 animate-pulse">✉️</div>
        <h1 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
          Project Invitation
        </h1>
        <div className="py-3 px-4 bg-blue-50/50 rounded-2xl border border-blue-100">
          <p className="text-blue-700 text-sm font-bold leading-relaxed">
            {status}
          </p>
        </div>

        {status.includes("invalid") && (
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

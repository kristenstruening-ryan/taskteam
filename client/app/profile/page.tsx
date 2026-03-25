"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setName(res.data.name || "");
        setEmail(res.data.email);
      } catch (error) {
        console.error(error, "Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/users/profile", { name });
      setMessage("Profile updated successfully!");

      localStorage.setItem("user_name", name);
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      setMessage("Failed to update.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-2xl mx-auto py-20 px-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          Account Settings
        </h1>
        <p className="text-slate-500 mb-10 font-medium">
          Manage your public identity and preferences.
        </p>

        <form
          onSubmit={handleUpdate}
          className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">
              Email Address (Read Only)
            </label>
            <input
              disabled
              value={email}
              className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">
              Display Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kristen S."
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl text-xs font-bold border ${
                message.includes("success")
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Toast from "@/components/Toast";
import DeleteModal from "@/components/DeleteModal";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  User,
  Shield,
  Lock,
  AlertTriangle,
  Loader2,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialName, setInitialName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setInitialName(res.data.name || "");
      } catch (error) {
        console.error(error);
        setToast({ message: "Failed to load profile.", type: "error" });
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.patch("/user/profile", { name: name.trim() });
      setInitialName(name.trim());
      localStorage.setItem("user_name", name.trim());
      window.dispatchEvent(new Event("local-storage-update"));
      setToast({ message: "Profile updated!", type: "success" });
    } catch (error: unknown) {
      let errorMsg = "Update failed.";
      if (axios.isAxiosError(error))
        errorMsg = error.response?.data?.message || errorMsg;
      setToast({ message: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ message: "New passwords do not match.", type: "error" });
      return;
    }
    setPassLoading(true);
    try {
      await api.patch("/user/password", { currentPassword, newPassword });
      setToast({ message: "Security protocol updated!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      let errorMsg = "Security update failed.";
      if (axios.isAxiosError(error))
        errorMsg = error.response?.data?.message || errorMsg;
      setToast({ message: errorMsg, type: "error" });
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete("/user/profile");
      localStorage.clear();
      router.push("/signup");
    } catch (error: unknown) {
      let errorMsg = "Could not delete account.";
      if (axios.isAxiosError(error))
        errorMsg = error.response?.data?.message || errorMsg;
      setToast({ message: errorMsg, type: "error" });
      setIsDeleteModalOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-32 selection:bg-indigo-500/30">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        title="Your Entire Account"
        variant="danger"
        description="This action is permanent. You will lose all your boards, tasks, and team access forever."
        confirmText="Permanently Delete My Account"
        requireConfirmationText="DELETE"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        loading={deleteLoading}
      />

      <div className="max-w-3xl mx-auto py-24 px-8 relative">
        {/* Atmospheric Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[120px] pointer-events-none" />

        <header className="mb-16">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all mb-8"
          >
            <ChevronLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Back to Terminal
          </Link>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border-2 border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tighter antialiased">
                Account Settings
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
                Personal Identity Configuration
              </p>
            </div>
          </div>
        </header>

        {/* Identity Section */}
        <form onSubmit={handleUpdate} className="space-y-8 mb-24">
          <div className="bg-[#1e293b] p-10 rounded-[3rem] border border-slate-800 shadow-2xl space-y-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full bg-[#0f172a]/50 border-2 border-slate-800 p-5 rounded-2xl text-sm text-slate-500 cursor-not-allowed font-bold outline-none shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0f172a] border-2 border-slate-800 p-5 rounded-2xl text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-bold shadow-inner"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || name === initialName}
            className="w-full bg-white text-[#0f172a] hover:bg-indigo-50 disabled:opacity-20 py-5 rounded-4xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </form>

        {/* Security Section */}
        <div className="pt-20 border-t border-slate-800/50">
          <div className="flex items-center gap-4 mb-10">
            <Shield className="text-indigo-400" size={24} strokeWidth={2.5} />
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter antialiased">
                Security Protocol
              </h2>
              <p className="text-slate-500 text-xs font-bold mt-1">
                Update your encryption keys to maintain access.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-8">
            <div className="bg-[#1e293b] p-10 rounded-[3rem] border border-slate-800 shadow-2xl space-y-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-slate-800 p-5 rounded-2xl text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-bold shadow-inner"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0f172a] border-2 border-slate-800 p-5 rounded-2xl text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-bold shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0f172a] border-2 border-slate-800 p-5 rounded-2xl text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-bold shadow-inner"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={passLoading || !currentPassword || !newPassword}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white py-5 rounded-4xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              {passLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Lock size={16} /> Update Security
                </>
              )}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-24 pt-24 border-t border-slate-800/50">
          <div className="bg-rose-500/5 border-2 border-rose-500/20 rounded-[3rem] p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-rose-500/10 group-hover:text-rose-500/20 transition-colors">
              <AlertTriangle size={120} strokeWidth={1} />
            </div>
            <h2 className="text-3xl font-black text-rose-500 tracking-tighter antialiased mb-2">
              Danger Zone
            </h2>
            <p className="text-slate-500 mb-10 font-bold text-sm leading-relaxed max-w-lg">
              Account termination is absolute. All data, team associations, and
              mission logs will be wiped from the terminal.
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-500/20 active:scale-95"
            >
              Terminate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

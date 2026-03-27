"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Toast from "@/components/Toast";
import DeleteModal from "@/components/DeleteModal";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialName, setInitialName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
        setToast({ message: "Failed to load profile.", type: "error" });
        console.error(error);
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
      if (axios.isAxiosError(error)) errorMsg = error.response?.data?.message || errorMsg;
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
      setToast({ message: "Password updated successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      let errorMsg = "Password update failed.";
      if (axios.isAxiosError(error)) errorMsg = error.response?.data?.message || errorMsg;
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
      router.push("/register");
    } catch (error: unknown) {
      let errorMsg = "Could not delete account.";
      if (axios.isAxiosError(error)) errorMsg = error.response?.data?.message || errorMsg;
      setToast({ message: errorMsg, type: "error" });
      setIsDeleteModalOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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

      <div className="max-w-2xl mx-auto py-20 px-6">
        <header className="mb-10">
          <Link href="/dashboard" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-4 block">← Back</Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        </header>

        <form onSubmit={handleUpdate} className="space-y-6 mb-16">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block px-1">Email Address</label>
              <input type="email" value={email} readOnly className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm text-slate-400 cursor-not-allowed font-medium outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block px-1">Display Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium" />
            </div>
          </div>
          <button type="submit" disabled={loading || name === initialName} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95">
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </form>

        <div className="border-t border-slate-200 pt-16">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Security</h2>
          <p className="text-slate-500 mb-8 font-medium">Update your password to keep your account secure.</p>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block px-1">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block px-1">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block px-1">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={passLoading || !currentPassword || !newPassword} className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-900/10 active:scale-95">
              {passLoading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>

        <div className="mt-16 pt-16 border-t border-slate-200">
          <div className="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-10">
            <h2 className="text-2xl font-black text-red-600 tracking-tight mb-2">Danger Zone</h2>
            <p className="text-slate-500 mb-8 font-medium leading-relaxed">Once you delete your account, there is no going back. Please be certain.</p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-white border border-red-200 text-red-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
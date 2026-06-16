"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { getMe, uploadProfilePicture, AppUser } from "@/lib/api";
import { Camera, User } from "lucide-react";

const ROLE_COLOURS: Record<string, string> = {
  ADMIN:        "bg-blue-100 text-blue-700",
  CEO:          "bg-red-100 text-red-700",
  DIRECTOR:     "bg-amber-100 text-amber-700",
  LOAN_OFFICER: "bg-emerald-100 text-emerald-700",
  BORROWER:     "bg-dark-100 text-dark-600",
};

export default function AdminProfile() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Determine portal from role
  const portal = (() => {
    const role = user?.role ?? (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}").role : "");
    if (role === "LOAN_OFFICER") return "staff";
    return "admin";
  })() as "admin" | "staff";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token) { router.push("/"); return; }
    if (stored) setUser(JSON.parse(stored));
    getMe()
      .then((data) => { setUser(data); localStorage.setItem("user", JSON.stringify(data)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const result = await uploadProfilePicture(file);
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));
      toast("Profile photo updated!");
    } catch {
      toast("Upload failed", false);
    } finally {
      setUploading(false);
    }
  };

  const toast = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const rolePill = ROLE_COLOURS[user?.role ?? ""] ?? "bg-dark-100 text-dark-600";
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  if (loading) return (
    <Layout portal="staff">
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    </Layout>
  );

  return (
    <Layout portal="staff">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-dark-800">My Profile</h1>
        <p className="text-dark-500 mt-1">Manage your account information and photo.</p>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-semibold ${msg.ok ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <div className="card max-w-2xl">
        {/* Avatar + name header */}
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-dark-200">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500 to-brand-500 flex items-center justify-center shadow-lg">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : initials ? (
                <span className="text-white font-black text-2xl">{initials}</span>
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center cursor-pointer text-white hover:bg-brand-600 transition-all shadow">
              {uploading ? <span className="text-xs">...</span> : <Camera className="w-4 h-4" />}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="text-2xl font-black text-dark-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-dark-500 text-sm mb-2">{user?.email}</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rolePill}`}>
              {user?.role?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "First Name",    value: user?.firstName },
            { label: "Last Name",     value: user?.lastName },
            { label: "Email",         value: user?.email },
            { label: "Phone",         value: user?.phone },
            { label: "Role",          value: user?.role?.replace("_", " ") },
            { label: "Member Since",  value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="label">{label}</p>
              <p className="text-dark-800 font-semibold">{value || <span className="text-dark-400 italic"></span>}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-dark-400 mt-6 pt-4 border-t border-dark-100">
          To update your name, email or phone  contact an administrator.
        </p>
      </div>
    </Layout>
  );
}

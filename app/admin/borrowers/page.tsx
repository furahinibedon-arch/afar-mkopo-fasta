"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { AppUser, getUsers, updateUserRole } from "@/lib/api";

const roles: AppUser["role"][] = ["BORROWER", "LOAN_OFFICER", "ADMIN"];

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getUsers()
      .then(setUsers)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
      return;
    }

    const role = JSON.parse(storedUser).role;
    if (role !== "ADMIN") {
      router.push(role === "LOAN_OFFICER" ? "/staff" : "/borrower");
      return;
    }

    load();
  }, [router]);

  const changeRole = async (id: string, role: AppUser["role"]) => {
    setSavingId(id);
    setError(null);
    try {
      const updated = await updateUserRole(id, role);
      setUsers((current) => current.map((user) => (user.id === id ? updated : user)));

      const currentUser = localStorage.getItem("user");
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        if (parsed.id === id) {
          localStorage.setItem("user", JSON.stringify({ ...parsed, role: updated.role }));
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Layout portal="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-navy-800">Users &amp; Roles</h1>
        <p className="text-slate-500 mt-1">
          Everyone uses one login page. Admin changes each user role here.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Borrowers" value={users.filter((user) => user.role === "BORROWER").length} />
        <StatCard label="Staff / Admin" value={users.filter((user) => user.role !== "BORROWER").length} />
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {["Name", "Email", "Phone", "Role", "Joined"].map((heading) => (
                  <th
                    key={heading}
                    className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-navy-800">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{user.email}</td>
                  <td className="py-3 px-3 text-slate-500">{user.phone}</td>
                  <td className="py-3 px-3">
                    <select
                      value={user.role}
                      onChange={(event) => changeRole(user.id, event.target.value as AppUser["role"])}
                      disabled={savingId === user.id}
                      className="input-field min-w-[170px] py-2"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {prettyRole(role)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-black text-navy-800 mt-1">{value}</p>
    </div>
  );
}

function prettyRole(role: AppUser["role"]) {
  if (role === "LOAN_OFFICER") return "Staff";
  if (role === "ADMIN") return "Admin";
  return "Borrower";
}

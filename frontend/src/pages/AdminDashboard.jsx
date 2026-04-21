import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const ROLE_OPTIONS = ["user", "admin", "gestionnaire"];

export default function AdminDashboard({
  title = "Admin Dashboard",
  subtitle = "Manage users, roles, and verification status"
}) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/users/admin/accounts");
      setAccounts(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountDetails = async (id) => {
    try {
      const res = await API.get(`/users/admin/accounts/${id}`);
      setSelectedAccount(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load account details");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter((account) =>
      [account.name, account.email, account.CIN]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term))
    );
  }, [accounts, search]);

  const handleToggleVerification = async (account) => {
    try {
      setError("");
      setSuccess("");
      const res = await API.patch(`/users/admin/accounts/${account._id}`, {
        emailVerified: !account.emailVerified
      });
      setSuccess("Account verification status updated");
      setAccounts((prev) => prev.map((u) => (u._id === account._id ? res.data : u)));
      if (selectedAccount?._id === account._id) {
        setSelectedAccount(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update verification status");
    }
  };

  const handleRoleChange = async (account, nextRole) => {
    try {
      setError("");
      setSuccess("");
      const res = await API.patch(`/users/admin/accounts/${account._id}`, { role: nextRole });
      setSuccess("Account role updated");
      setAccounts((prev) => prev.map((u) => (u._id === account._id ? res.data : u)));
      if (selectedAccount?._id === account._id) {
        setSelectedAccount(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Delete account ${account.email}?`)) return;

    try {
      setError("");
      setSuccess("");
      await API.delete(`/users/admin/accounts/${account._id}`);
      setSuccess("Account deleted successfully");
      setAccounts((prev) => prev.filter((u) => u._id !== account._id));
      if (selectedAccount?._id === account._id) {
        setSelectedAccount(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-[#1a365d] to-[#2d4a7c] px-6 py-8 md:px-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
            <p className="text-blue-100 mt-2">{subtitle}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700">{success}</div>}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, CIN..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#00a67e]"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-[#1a365d]">Accounts</h2>
                <button
                  onClick={fetchAccounts}
                  className="text-sm bg-[#1a365d] text-white px-3 py-1.5 rounded-lg hover:bg-[#163050]"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="p-6 text-gray-500">Loading accounts...</div>
              ) : filteredAccounts.length === 0 ? (
                <div className="p-6 text-gray-500">No accounts found.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredAccounts.map((account) => (
                    <div key={account._id} className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#1a365d]">{account.name}</p>
                        <p className="text-sm text-gray-600">{account.email}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">Role: {account.role}</span>
                          <span
                            className={`px-2 py-1 rounded ${
                              account.emailVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {account.emailVerified ? "Verified" : "Not verified"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() => fetchAccountDetails(account._id)}
                          className="text-xs px-3 py-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleToggleVerification(account)}
                          className="text-xs px-3 py-1.5 rounded bg-amber-100 text-amber-700 hover:bg-amber-200"
                        >
                          Toggle Verify
                        </button>
                        <select
                          value={account.role}
                          onChange={(e) => handleRoleChange(account, e.target.value)}
                          className="text-xs px-3 py-1.5 rounded bg-purple-100 text-purple-700 border border-purple-200"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDelete(account)}
                          className="text-xs px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-[#1a365d] mb-3">Account details</h2>
              {!selectedAccount ? (
                <p className="text-sm text-gray-500">Select an account to inspect details.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedAccount.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedAccount.email}</p>
                  <p><span className="font-medium">CIN:</span> {selectedAccount.CIN || "-"}</p>
                  <p><span className="font-medium">Phone:</span> {selectedAccount.phone || "-"}</p>
                  <p><span className="font-medium">Role:</span> {selectedAccount.role}</p>
                  <p><span className="font-medium">Verified:</span> {selectedAccount.emailVerified ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Created:</span> {selectedAccount.createdAt ? new Date(selectedAccount.createdAt).toLocaleString() : "-"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

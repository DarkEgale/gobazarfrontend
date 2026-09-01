import { memo, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiSearch, FiUsers, FiMail, FiShield, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { API_ENDPOINTS, getApiUrl } from "../../config/apiConfig";

const USERS_API = `${getApiUrl(API_ENDPOINTS.ADMIN_USERS)}`;

const AdminCustomers = memo(() => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user: currentUser } = useSelector((state) => state.auth);

  // Fetch all users (Admin) from backend
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${USERS_API}?limit=100`, {
        withCredentials: true,
      });
      const raw = res.data?.data?.users || [];
      const mapped = raw.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        orders: user.orders || 0,
        spent: user.totalSpent || 0,
        joined: user.createdAt
          ? new Date(user.createdAt).toISOString().slice(0, 10)
          : "",
        role: user.role || "user",
        status: user.isVerified ? "Active" : "Inactive",
      }));
      setCustomers(mapped);
    } catch (error) {
      console.error(
        "Fetch users error:",
        error.response?.data?.message || error.message,
      );
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Delete user (Admin) — backend-এ self-delete block করা আছে
  const handleDelete = useCallback(async (id) => {
    if (
      !window.confirm(
        "Delete this user? Their orders and wishlist will also be removed.",
      )
    )
      return;
    try {
      await axios.delete(
        `${getApiUrl(API_ENDPOINTS.DELETE_USER)}/${id}`,
        { withCredentials: true },
      );
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <FiSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <FiUsers size={16} />
          <span>{filteredCustomers.length} customers</span>
        </div>
      </div>

      {/* Customers table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Orders</th>
              <th className="px-5 py-3.5">Total Spent</th>
              <th className="px-5 py-3.5">Joined</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-600/20 text-sm font-bold text-violet-300 ring-1 ring-violet-500/30">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {customer.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-zinc-600">
                        <FiMail size={11} />
                        {customer.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-zinc-400">
                  {customer.orders}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-white">
                  ${customer.spent.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-sm text-zinc-500">
                  {customer.joined}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ring-1 ${
                      customer.role === "admin"
                        ? "bg-violet-500/10 text-violet-400 ring-violet-500/20"
                        : "bg-white/[0.04] text-zinc-500 ring-white/[0.08]"
                    }`}
                  >
                    <FiShield size={11} />
                    {customer.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold ring-1 ${
                      customer.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                        : "bg-zinc-500/10 text-zinc-500 ring-zinc-500/20"
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {currentUser && currentUser._id === customer.id ? (
                    <span className="text-[11px] font-semibold text-zinc-600">
                      You
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                    >
                      <FiTrash2 size={13} />
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
              <FiUsers size={28} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-white">
              {loading ? "Loading customers..." : "No customers found"}
            </h3>
            {!loading && (
              <p className="mt-1 text-xs text-zinc-500">
                Try a different search term
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

AdminCustomers.displayName = "AdminCustomers";

export default AdminCustomers;

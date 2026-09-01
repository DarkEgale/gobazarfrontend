import { memo, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiSearch, FiShoppingBag, FiEye } from "react-icons/fi";
import { API_ENDPOINTS, getApiUrl } from "../../config/apiConfig";

const STATUS_STYLES = {
  paid: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  cash_on_delivery: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  pending: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  cancelled: "bg-red-500/10 text-red-400 ring-red-500/20",
};

const STATUS_LABELS = {
  paid: "Paid",
  cash_on_delivery: "Cash on Delivery",
  pending: "Pending",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS = {
  cash: "COD",
  bekash: "bKash",
  nagad: "Nagad",
};

const ORDERS_API = `${getApiUrl(API_ENDPOINTS.ADMIN_ORDERS)}`;


const AdminOrders = memo(() => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch all orders (Admin) from backend
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${ORDERS_API}?limit=100`, {
        withCredentials: true,
      });
      const raw = res.data?.data?.orders || [];
      const mapped = raw.map((order) => ({
        id: `#${String(order._id).slice(-6).toUpperCase()}`,
        customer: order.userId?.name || "Unknown User",
        email: order.userId?.email || "",
        product:
          order.products
            ?.map((p) => p.productId?.title || "Product")
            .join(", ") || "No products",
        amount: order.totalAmount || 0,
        status: order.paymentStatus || "pending",
        date: order.createdAt
          ? new Date(order.createdAt).toISOString().slice(0, 10)
          : "",
        payment: PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod,
      }));
      setOrders(mapped);
    } catch (error) {
      console.error(
        "Fetch orders error:",
        error.response?.data?.message || error.message,
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(
    (o) =>
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Search orders..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <FiShoppingBag size={16} />
          <span>{filteredOrders.length} orders</span>
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              <th className="px-5 py-3.5">Order</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Product</th>
              <th className="px-5 py-3.5">Amount</th>
              <th className="px-5 py-3.5">Payment</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-5 py-4 text-sm font-semibold text-violet-400">
                  {order.id}
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-white">
                    {order.customer}
                  </p>
                  <p className="text-xs text-zinc-600">{order.email}</p>
                </td>
                <td className="max-w-[220px] truncate px-5 py-4 text-sm text-zinc-400">
                  {order.product}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-white">
                  ${order.amount.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-sm text-zinc-400">
                  {order.payment}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold ring-1 ${STATUS_STYLES[order.status] || "bg-zinc-500/10 text-zinc-500 ring-zinc-500/20"}`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-zinc-500">
                  {order.date}
                </td>
                <td className="px-5 py-4">
                  <button
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
                    aria-label={`View order ${order.id}`}
                  >
                    <FiEye size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
              <FiShoppingBag size={28} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-white">
              {loading ? "Loading orders..." : "No orders found"}
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

AdminOrders.displayName = "AdminOrders";

export default AdminOrders;

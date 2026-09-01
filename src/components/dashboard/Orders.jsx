import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPackage,
  FiSearch,
  FiChevronRight,
  FiAlertCircle,
  FiTruck,
  FiCreditCard,
} from "react-icons/fi";
import { getOrders } from "../../store/slices/orderSlice";

const PAYMENT_STATUS_STYLES = {
  cash_on_delivery: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  pending: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  paid: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
};

const PAYMENT_STATUS_LABELS = {
  cash_on_delivery: "Cash on Delivery",
  pending: "Pending",
  paid: "Paid",
};

const ORDER_STATUS_STYLES = {
  pending: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  shipping: "text-sky-400 bg-sky-500/10 ring-sky-500/20",
  shipped: "text-indigo-400 bg-indigo-500/10 ring-indigo-500/20",
  "on the way": "text-violet-400 bg-violet-500/10 ring-violet-500/20",
  deliverd: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
};

const ORDER_STATUS_LABELS = {
  pending: "Pending",
  shipping: "Shipping",
  shipped: "Shipped",
  "on the way": "On the way",
  deliverd: "Delivered",
};

const FILTERS = ["All", "Cash on Delivery", "Pending", "Paid"];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getOrderTitle = (order) => {
  const first = order.products?.[0]?.productId;
  if (!first) return "Product removed";
  const title = first.title || "Untitled Product";
  const extra = order.products.length - 1;
  return extra > 0 ? `${title} +${extra} more` : title;
};

const getTotalItems = (order) =>
  order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;

const OrderRow = memo(({ order, onViewOrder }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={() => onViewOrder?.(order._id)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") onViewOrder?.(order._id);
    }}
    className="grid cursor-pointer grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-white/[0.02] md:grid-cols-[1fr_120px_110px_230px_40px] md:items-center md:gap-4"
  >
    {/* Product */}
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
        {order.products?.[0]?.productId?.thumbnil ? (
          <img
            src={order.products[0].productId.thumbnil}
            alt={order.products[0].productId.title || "Product"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-violet-400">
            <FiPackage size={18} />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {getOrderTitle(order)}
        </p>
        <p className="text-xs text-zinc-500">
          #{order._id?.slice(-8).toUpperCase()} • {getTotalItems(order)} item
          {getTotalItems(order) > 1 ? "s" : ""}
        </p>
      </div>
    </div>

    {/* Date */}
    <p className="text-xs text-zinc-500 md:text-sm">
      {formatDate(order.createdAt)}
    </p>

    {/* Amount */}
    <p className="text-sm font-bold text-white">
      ৳{Number(order.totalAmount || 0).toFixed(2)}
    </p>

    {/* Status (payment + order) */}
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Payment status */}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
          PAYMENT_STATUS_STYLES[order.paymentStatus] ||
          "text-zinc-400 bg-white/[0.04] ring-white/[0.08]"
        }`}
      >
        <FiCreditCard size={11} />
        {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
      </span>

      {/* Order status */}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
          ORDER_STATUS_STYLES[order.orderStatus] ||
          "text-zinc-400 bg-white/[0.04] ring-white/[0.08]"
        }`}
      >
        <FiTruck size={11} />
        {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
      </span>
    </div>

    {/* View */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onViewOrder?.(order._id);
      }}
      className="hidden h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white/[0.06] hover:text-violet-400 md:flex"
      aria-label={`View order ${order._id}`}
    >
      <FiChevronRight size={16} />
    </button>
  </div>
));

OrderRow.displayName = "OrderRow";

const Orders = memo(({ onViewOrder }) => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  const filteredOrders = (orders || []).filter((order) => {
    const statusLabel =
      PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus;
    const matchesFilter = filter === "All" || statusLabel === filter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      getOrderTitle(order).toLowerCase().includes(searchLower) ||
      order._id?.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <FiAlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                filter === f
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25"
                  : "bg-white/[0.04] text-zinc-500 ring-1 ring-white/[0.08] hover:bg-white/[0.08] hover:text-zinc-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <FiSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>
      </div>

      {/* Orders list */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        {/* Table header (desktop) */}
        <div className="hidden border-b border-white/[0.06] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 md:grid md:grid-cols-[1fr_120px_110px_230px_40px] md:gap-4">
          <span>Product</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Status</span>
          <span />
        </div>

        <div className="divide-y divide-white/[0.04]">
          {loading && orders.length === 0 ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/3 rounded bg-white/[0.06]" />
                    <div className="h-3 w-1/5 rounded bg-white/[0.06]" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
                <FiPackage size={28} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">
                No orders found
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderRow key={order._id} order={order} onViewOrder={onViewOrder} />
            ))
          )}
        </div>
      </div>
    </div>
  );
});

Orders.displayName = "Orders";

export default Orders;

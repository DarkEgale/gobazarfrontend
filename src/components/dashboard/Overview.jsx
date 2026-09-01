import { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiShoppingBag,
  FiHeart,
  FiCheckCircle,
  FiCreditCard,
  FiTrendingUp,
  FiPackage,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import { getOrders } from "../../store/slices/orderSlice";
import { getWish } from "../../store/slices/wishSlice";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const STATUS_STYLES = {
  cash_on_delivery: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  pending: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  paid: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
};

const STATUS_LABELS = {
  cash_on_delivery: "Cash on Delivery",
  pending: "Pending",
  paid: "Paid",
};

const StatCard = memo(({ stat }) => {
  const Icon = stat.icon;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]">
      {/* Glow */}
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow}`}
          >
            <Icon size={20} className="text-white" />
          </div>

          {stat.badge && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
              <FiTrendingUp size={12} />
              {stat.badge}
            </span>
          )}
        </div>

        <p className="mt-4 text-2xl font-bold tracking-tight text-white">
          {stat.value}
        </p>
        <p className="mt-1 text-xs font-medium text-zinc-500">{stat.label}</p>
      </div>
    </div>
  );
});

StatCard.displayName = "StatCard";

const Overview = memo(() => {
  const dispatch = useDispatch();
  const { orders, loading: ordersLoading, error: ordersError } = useSelector(
    (state) => state.order
  );
  const { wishlist, loading: wishLoading } = useSelector(
    (state) => state.wish
  );

  useEffect(() => {
    dispatch(getOrders());
    dispatch(getWish());
  }, [dispatch]);

  // Derived stats from real data
  const totalSpend = orders.reduce(
    (sum, order) => sum + (Number(order.totalAmount) || 0),
    0
  );
  const totalItems = orders.reduce(
    (sum, order) =>
      sum +
      (order.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0),
    0
  );
  const paidCount = orders.filter((o) => o.paymentStatus === "paid").length;

  const STATS = [
    {
      id: "total",
      label: "Total Orders",
      value: orders.length,
      badge: totalItems > 0 ? `${totalItems} items` : null,
      icon: FiShoppingBag,
      gradient: "from-violet-500 to-indigo-600",
      shadow: "shadow-violet-500/30",
    },
    {
      id: "spend",
      label: "Total Spend",
      value: `৳${totalSpend.toFixed(2)}`,
      badge: paidCount > 0 ? `${paidCount} paid` : null,
      icon: FiCreditCard,
      gradient: "from-fuchsia-500 to-pink-600",
      shadow: "shadow-fuchsia-500/30",
    },
    {
      id: "wishlist",
      label: "Wishlist Items",
      value: wishlist.length,
      badge: wishlist.length > 0 ? "Saved" : null,
      icon: FiHeart,
      gradient: "from-rose-500 to-red-600",
      shadow: "shadow-rose-500/30",
    },
    {
      id: "completed",
      label: "Deliverable Orders",
      value: orders.length - paidCount,
      badge: "COD",
      icon: FiCheckCircle,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/30",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {ordersError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <FiAlertCircle size={16} />
          {ordersError}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Orders</h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              Your latest purchases
            </p>
          </div>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {(ordersLoading || wishLoading) && orders.length === 0 ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/3 rounded bg-white/[0.06]" />
                    <div className="h-3 w-1/5 rounded bg-white/[0.06]" />
                  </div>
                </div>
              </div>
            ))
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
                <FiPackage size={24} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-white">
                No orders yet
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Your recent purchases will appear here
              </p>
            </div>
          ) : (
            recentOrders.map((order) => {
              const product = order.products?.[0]?.productId;
              const extra = order.products?.length - 1;
              return (
                <div
                  key={order._id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
                    {product?.thumbnil ? (
                      <img
                        src={product.thumbnil}
                        alt={product.title || "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-violet-400">
                        <FiPackage size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {product?.title || "Product removed"}
                      {extra > 0 && ` +${extra} more`}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      #{order._id?.slice(-8).toUpperCase()} •{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 sm:inline-block ${
                      STATUS_STYLES[order.paymentStatus] ||
                      "text-zinc-400 bg-white/[0.04] ring-white/[0.08]"
                    }`}
                  >
                    {STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                  </span>

                  <p className="shrink-0 text-sm font-bold text-white">
                    ৳{Number(order.totalAmount || 0).toFixed(2)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

Overview.displayName = "Overview";

export default Overview;
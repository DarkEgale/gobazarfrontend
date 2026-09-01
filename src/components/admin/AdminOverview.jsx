import { memo } from "react";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";

const STATS = [
  {
    id: 1,
    label: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    up: true,
    icon: FiDollarSign,
  },
  {
    id: 2,
    label: "Total Orders",
    value: "1,234",
    change: "+12.5%",
    up: true,
    icon: FiShoppingBag,
  },
  {
    id: 3,
    label: "Total Customers",
    value: "892",
    change: "+8.2%",
    up: true,
    icon: FiUsers,
  },
  {
    id: 4,
    label: "Active Products",
    value: "456",
    change: "-2.4%",
    up: false,
    icon: FiTrendingUp,
  },
];

const RECENT_ORDERS = [
  {
    id: "#ORD-7842",
    customer: "John Carter",
    product: "Wireless Headphones Pro",
    amount: "$89.99",
    status: "Completed",
    date: "2 min ago",
  },
  {
    id: "#ORD-7841",
    customer: "Sarah Mitchell",
    product: "Smart Watch Series 5",
    amount: "$199.00",
    status: "Pending",
    date: "15 min ago",
  },
  {
    id: "#ORD-7840",
    customer: "David Lee",
    product: "Mechanical Keyboard RGB",
    amount: "$129.50",
    status: "Processing",
    date: "28 min ago",
  },
  {
    id: "#ORD-7839",
    customer: "Emily White",
    product: "4K Action Camera",
    amount: "$249.99",
    status: "Completed",
    date: "1 hr ago",
  },
];

const STATUS_STYLES = {
  Completed: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  Processing: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
};

const AdminOverview = memo(() => {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ id, label, value, change, up, icon: Icon }) => (
          <div
            key={id}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-colors hover:border-white/[0.12]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
                <Icon size={18} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  up ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {up ? (
                  <FiArrowUpRight size={14} />
                ) : (
                  <FiArrowDownRight size={14} />
                )}
                {change}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-white">
              {value}
            </p>
            <p className="mt-1 text-sm text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Orders</h3>
            <p className="text-xs text-zinc-500">
              Latest transactions from your store
            </p>
          </div>
          <button className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-400 transition hover:bg-white/[0.08] hover:text-white">
            View All
          </button>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {RECENT_ORDERS.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-sm font-semibold text-violet-400">
                  {order.id}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {order.customer}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {order.product}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="hidden text-sm font-semibold text-white sm:block">
                  {order.amount}
                </span>
                <span
                  className={`hidden rounded-lg px-2 py-1 text-[11px] font-semibold ring-1 sm:block ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
                <span className="text-xs text-zinc-600">{order.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

AdminOverview.displayName = "AdminOverview";

export default AdminOverview;

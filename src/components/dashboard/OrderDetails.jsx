import { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiArrowLeft,
  FiPackage,
  FiMapPin,
  FiTruck,
  FiCreditCard,
  FiAlertCircle,
  FiCalendar,
  FiHash,
} from "react-icons/fi";
import { getOrderById } from "../../store/slices/orderSlice";

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

const PAYMENT_METHOD_LABELS = {
  cash: "Cash on Delivery",
  bekash: "bKash",
  nagad: "Nagad",
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const StatusBadge = ({ styles, labels, value, icon: Icon }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
      styles[value] || "text-zinc-400 bg-white/[0.04] ring-white/[0.08]"
    }`}
  >
    <Icon size={12} />
    {labels[value] || value}
  </span>
);


const OrderDetails = memo(({ orderId, onBack }) => {
  const dispatch = useDispatch();
  const { currentOrder: order, currentOrderLoading: loading, error } =
    useSelector((state) => state.order);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [dispatch, orderId]);

  /* ---------- Loading state ---------- */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="animate-pulse space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <div className="h-4 w-1/3 rounded bg-white/[0.06]" />
          <div className="h-20 rounded-xl bg-white/[0.06]" />
          <div className="h-20 rounded-xl bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  /* ---------- Error / not found state ---------- */
  if (error || !order) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-violet-500/30 hover:text-violet-300"
        >
          <FiArrowLeft size={15} />
          Back to Orders
        </button>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
            <FiAlertCircle size={28} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-white">
            {error || "Order not found"}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            This order may not exist or belongs to another account
          </p>
        </div>
      </div>
    );
  }

  const items = order.products || [];
  const totalItems = items.reduce((sum, p) => sum + (p.quantity || 0), 0);

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-violet-500/30 hover:text-violet-300"
      >
        <FiArrowLeft size={15} />
        Back to Orders
      </button>

      {/* Order header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-white">
            <FiHash size={14} className="text-violet-400" />
            Order #{order._id?.slice(-8).toUpperCase()}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <FiCalendar size={11} />
            Placed on {formatDate(order.createdAt)} • {totalItems} item
            {totalItems > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            styles={PAYMENT_STATUS_STYLES}
            labels={PAYMENT_STATUS_LABELS}
            value={order.paymentStatus}
            icon={FiCreditCard}
          />
          <StatusBadge
            styles={ORDER_STATUS_STYLES}
            labels={ORDER_STATUS_LABELS}
            value={order.orderStatus}
            icon={FiTruck}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Products */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
          <div className="border-b border-white/[0.06] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Products ({items.length})
          </div>

          <div className="divide-y divide-white/[0.04]">
            {items.map((item, index) => {
              const product = item.productId;
              const key = product?._id || `item-${index}`;
              return (
                <div
                  key={key}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
                    {product?.thumbnil ? (
                      <img
                        src={product.thumbnil}
                        alt={product.title || "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-violet-400">
                        <FiPackage size={20} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {product?.title || "Product removed"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      ৳{Number(item.price || 0).toFixed(2)} × {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-white">
                    ৳
                    {(
                      Number(item.price || 0) * (item.quantity || 0)
                    ).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary + address */}
        <div className="space-y-5">
          {/* Delivery address */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <FiMapPin size={12} />
              Delivery Address
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {order.address || "No address provided"}
            </p>
          </div>

          {/* Payment + summary */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <FiCreditCard size={12} />
              Payment
            </h4>
            <p className="mt-2 text-sm font-semibold text-white">
              {PAYMENT_METHOD_LABELS[order.paymentMethod] ||
                order.paymentMethod ||
                "—"}
            </p>

            <div className="mt-4 space-y-2.5 border-t border-white/[0.06] pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-semibold text-white">
                  ৳{Number(order.subtotal || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Delivery Charge</span>
                <span
                  className={`font-semibold ${
                    Number(order.deliveryCharge) === 0
                      ? "text-emerald-400"
                      : "text-white"
                  }`}
                >
                  {Number(order.deliveryCharge) === 0
                    ? "Free"
                    : `৳${Number(order.deliveryCharge).toFixed(2)}`}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="text-lg font-bold text-white">
                  ৳{Number(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OrderDetails.displayName = "OrderDetails";

export default OrderDetails;


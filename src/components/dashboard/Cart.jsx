import { memo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiTruck,
  FiCreditCard,
  FiInfo,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import { getApiUrl, API_ENDPOINTS } from "../../config/apiConfig";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../store/slices/cartSlice";

const getDiscountedPrice = (item) =>
  item.discount ? item.price - (item.price * item.discount) / 100 : item.price;

// Delivery is charged once per order (not per product) — the order ships as
// one consignment, so the highest per-product delivery charge applies.
// 0 / undefined delivary counts as free.
const getDeliveryFee = (items) =>
  items.reduce((max, item) => Math.max(max, Number(item.delivary) || 0), 0);

// Free delivery on orders above this subtotal (BDT)
const FREE_DELIVERY_THRESHOLD = 2000;

const PAYMENT_METHODS = [
  {
    value: "cash",
    label: "Cash on Delivery",
    description: "Pay with cash when your order arrives",
    icon: FiTruck,
    enabled: true,
  },
  {
    value: "online",
    label: "Online Payment",
    description: "bKash / Nagad / Card — coming soon",
    icon: FiCreditCard,
    enabled: false,
  },
];

const CartItem = memo(({ item, onUpdateQty, onRemove }) => {
  const unitPrice = getDiscountedPrice(item);
  const lineTotal = unitPrice * item.quantity;
  const originalTotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-colors hover:border-violet-500/25">
      {/* Product image */}
      <Link
        to={`/product/${item._id}`}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#111116] ring-1 ring-white/[0.08]"
        aria-label={`View ${item.title}`}
      >
        {item.thumbnil ? (
          <img
            src={item.thumbnil}
            alt={item.title || "Product"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FiShoppingBag size={22} className="text-zinc-600" />
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/product/${item._id}`}
              className="block truncate text-sm font-semibold text-white transition-colors hover:text-violet-300"
            >
              {item.title}
            </Link>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {item.category || "General"}
              {item.subCategory ? ` • ${item.subCategory}` : ""}
            </p>
          </div>

          <button
            onClick={() => onRemove(item._id)}
            className="shrink-0 rounded-lg p-1.5 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Remove ${item.title}`}
          >
            <FiTrash2 size={16} />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          {/* Unit price */}
          <div>
            <p className="text-xs font-semibold text-violet-300">
              ৳{unitPrice.toFixed(2)}
            </p>
            {item.discount > 0 && (
              <p className="mt-0.5 text-[11px] text-zinc-600 line-through">
                ৳{item.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Quantity + line total */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.08]">
              <button
                onClick={() =>
                  onUpdateQty(item._id, Math.max(1, item.quantity - 1))
                }
                className="rounded-md p-1.5 text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
                aria-label="Decrease quantity"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-7 text-center text-sm font-semibold text-white">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQty(item._id, item.quantity + 1)}
                className="rounded-md p-1.5 text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
                aria-label="Increase quantity"
              >
                <FiPlus size={14} />
              </button>
            </div>

            <p className="shrink-0 text-sm font-bold text-white">
              ৳{lineTotal.toFixed(2)}
              {lineTotal !== originalTotal && (
                <span className="ml-1.5 text-[11px] font-medium text-zinc-600 line-through">
                  ৳{originalTotal.toFixed(2)}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = "CartItem";

const Cart = memo(() => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const [isPlacing, setIsPlacing] = useState(false);
  const [notice, setNotice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const handleUpdateQty = useCallback(
    (id, quantity) => {
      dispatch(updateQuantity({ id, quantity }));
    },
    [dispatch],
  );

  const handleRemove = useCallback(
    (id) => {
      dispatch(removeFromCart(id));
    },
    [dispatch],
  );

  const handleClear = useCallback(() => {
    setNotice(null);
    dispatch(clearCart());
  }, [dispatch]);

  /* ---------- Totals (discount-aware) ---------- */
  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const savings = items.reduce(
    (sum, item) =>
      sum +
      (item.discount ? (item.price * item.quantity * item.discount) / 100 : 0),
    0,
  );
  const subtotal = rawSubtotal - savings;
  /* Delivery is charged once per order — free when subtotal crosses the threshold */
  const deliveryFee = subtotal > FREE_DELIVERY_THRESHOLD ? 0 : getDeliveryFee(items);
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const createOrder = async () => {
    /* User must write a delivery address first */
    if (!address.trim()) {
      setNotice({ type: "error", text: "Please enter your delivery address" });
      return;
    }

    /* User must enter a valid phone number (Bangladeshi mobile) */
    if (!phone.trim()) {
      setNotice({ type: "error", text: "Please enter your phone number" });
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) {
      setNotice({
        type: "error",
        text: "Please enter a valid 11-digit mobile number (e.g. 01712345678)",
      });
      return;
    }

    /* User must select a payment method first */
    if (!paymentMethod) {
      setNotice({ type: "error", text: "Please select a payment method" });
      return;
    }

    /* Online payment is not integrated yet — do nothing for now */
    if (paymentMethod !== "cash") {
      setNotice({
        type: "error",
        text: "Online payment is not available yet. Please select Cash on Delivery.",
      });
      return;
    }

    try {
      setIsPlacing(true);
      setNotice(null);

      const products = items.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price,
      }));

      await axios.post(
        getApiUrl(API_ENDPOINTS.CREATE_ORDER),
        {
          products,
          paymentMethod,
          address: address.trim(),
          phone: phone.trim(),
        },
        {
          withCredentials: true,
        },
      );

      dispatch(clearCart());
      setNotice({ type: "success", text: "Order placed successfully!" });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.response?.data?.message || "Failed to place order",
      });
    } finally {
      setIsPlacing(false);
    }
  };

  /* ---------- Empty state ---------- */
  if (items.length === 0) {
    return (
      <div className="space-y-6">
        {notice?.type === "success" && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
            <FiCheckCircle size={15} />
            {notice.text}
          </div>
        )}

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
            <FiShoppingBag size={28} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-white">
            Your cart is empty
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Add some products to get started
          </p>
          <Link
            to="/"
            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-violet-600/30"
          >
            Start Shopping
            <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Notice */}
      {notice && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ring-1 ${
            notice.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
              : "bg-red-500/10 text-red-400 ring-red-500/20"
          }`}
        >
          {notice.type === "success" ? (
            <FiCheckCircle size={15} />
          ) : (
            <FiAlertCircle size={15} />
          )}
          {notice.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          <span className="font-semibold text-white">{items.length}</span>{" "}
          product{items.length !== 1 ? "s" : ""} •{" "}
          <span className="font-semibold text-white">{itemCount}</span> item
          {itemCount !== 1 ? "s" : ""} in your cart
        </p>

        <button
          onClick={handleClear}
          disabled={isPlacing}
          className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 transition-all duration-200 hover:bg-rose-500/20 disabled:opacity-50"
        >
          <FiTrash2 size={13} />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* Cart items */}
        <div className="space-y-4">
          {items.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              onUpdateQty={handleUpdateQty}
              onRemove={handleRemove}
            />
          ))}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 xl:sticky xl:top-24">
          <h3 className="text-sm font-bold text-white">Order Summary</h3>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-semibold text-white">
                ৳{subtotal.toFixed(2)}
              </span>
            </div>

            {savings > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-400">Discount savings</span>
                <span className="font-semibold text-emerald-400">
                  -৳{savings.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">
                Delivery Charge{" "}
                <span className="text-[11px] text-zinc-600">(per order)</span>
              </span>
              <span
                className={`font-semibold ${
                  deliveryFee === 0 ? "text-emerald-400" : "text-white"
                }`}
              >
                {deliveryFee === 0 ? "Free" : `৳${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            {subtotal <= FREE_DELIVERY_THRESHOLD && (
              <div className="flex items-start gap-1.5 rounded-lg bg-violet-500/[0.07] px-2.5 py-2 text-[11px] text-violet-300/80 ring-1 ring-violet-500/15">
                <FiInfo size={12} className="mt-0.5 shrink-0" />
                <span>
                  Add ৳{(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2)} more to
                  get free delivery (orders over ৳{FREE_DELIVERY_THRESHOLD})
                </span>
              </div>
            )}

            <div className="border-t border-white/[0.06] pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="text-lg font-bold text-white">
                  ৳{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="mt-5">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <FiMapPin size={12} />
              Delivery Address
            </h4>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isPlacing}
              rows={3}
              maxLength={500}
              placeholder="House / Road / Area, City — where should we deliver?"
              className="mt-2.5 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
            />
            <p className="mt-1 text-right text-[11px] text-zinc-600">
              {address.length}/500
            </p>

            {/* Phone number */}
            <div className="mt-3">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <FiPhone size={12} />
                Phone Number
              </h4>
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 11))
                }
                disabled={isPlacing}
                inputMode="numeric"
                maxLength={11}
                placeholder="01XXXXXXXXX — for delivery contact"
                className="mt-2.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Payment method (radio style) */}
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Payment Method
            </h4>
            <div className="mt-2.5 space-y-2.5">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const selected = paymentMethod === method.value;
                return (
                  <label
                    key={method.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                      selected
                        ? "border-violet-500/60 bg-violet-500/[0.08] ring-4 ring-violet-500/10"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-violet-500/30"
                    } ${!method.enabled ? "opacity-60" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={selected}
                      onChange={() =>
                        method.enabled && setPaymentMethod(method.value)
                      }
                      disabled={!method.enabled || isPlacing}
                      className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border border-zinc-600 transition-all checked:border-violet-500 checked:bg-violet-500 checked:shadow-[inset_0_0_0_3px_#0b0b10]"
                    />
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-violet-300 ring-1 ring-white/[0.08]">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold text-white">
                        {method.label}
                        {!method.enabled && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/20">
                            Coming Soon
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[11px] text-zinc-500">
                        {method.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            onClick={createOrder}
            disabled={isPlacing || !paymentMethod || paymentMethod !== "cash"}
            className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-violet-600/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isPlacing
              ? "Placing order..."
              : !paymentMethod
                ? "Select a Payment Method"
                : paymentMethod === "cash"
                  ? "Place Order (Cash on Delivery)"
                  : "Online Payment Unavailable"}
            {!isPlacing && paymentMethod === "cash" && (
              <FiArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            )}
          </button>

          <Link
            to="/"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] py-3 text-sm font-semibold text-zinc-300 transition-all duration-200 hover:border-violet-500/30 hover:text-violet-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
});

Cart.displayName = "Cart";

export default Cart;

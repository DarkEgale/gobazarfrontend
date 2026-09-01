import { memo } from "react";
import { useSelector } from "react-redux";
import { selectCartCount } from "../store/slices/cartSlice";
import {
  FiGrid,
  FiShoppingCart,
  FiHeart,
  FiPackage,
  FiSettings,
  FiX,
} from "react-icons/fi";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: FiGrid },
  { id: "cart", label: "Cart", icon: FiShoppingCart },
  { id: "wishlist", label: "Wishlist", icon: FiHeart },
  { id: "orders", label: "Orders", icon: FiPackage },
  { id: "settings", label: "Settings", icon: FiSettings },
];

const UserSidebar = memo(({ activeTab, onTabChange, isOpen, onClose }) => {
  const cartCount = useSelector(selectCartCount);
  const wishCount = useSelector((state) => state.wish.totalwish);
  const orderCount = useSelector((state) => state.order.totalOrders);
  const { user } = useSelector((state) => state.auth);
  const initial = (user?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/[0.06] bg-[#0a0a0f] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.06] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 8h12l1 12H5L6 8Z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Go
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Bazar
              </span>
            </span>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-zinc-600">
            Menu
          </p>

          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  onTabChange(id);
                  onClose();
                }}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-300 ring-1 ring-violet-500/30"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                )}

                <Icon
                  size={19}
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? "text-violet-400"
                      : "text-zinc-600 group-hover:text-zinc-400"
                  }`}
                />
                <span>{label}</span>

                {id === "cart" && cartCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}

                {id === "wishlist" && wishCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-bold text-white">
                    {wishCount > 99 ? "99+" : wishCount}
                  </span>
                )}

                {id === "orders" && orderCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                    {orderCount > 99 ? "99+" : orderCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User card */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06]">
            <div className="relative shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="User avatar"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-500/40"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-600/20 text-sm font-bold text-violet-300 ring-2 ring-violet-500/40">
                  {initial}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0f] bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});

UserSidebar.displayName = "UserSidebar";

export default UserSidebar;

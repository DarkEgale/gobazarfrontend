import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiMenu, FiBell, FiMoon, FiSun } from "react-icons/fi";
import { logoutUser } from "../store/slices/authSlice";
import UserSidebar from "../components/userSidebar";
import Overview from "../components/dashboard/Overview";
import Cart from "../components/dashboard/Cart";
import Orders from "../components/dashboard/Orders";
import Wishlist from "../components/dashboard/Wishlist";
import Settings from "../components/dashboard/Settings";
import OrderDetails from "../components/dashboard/OrderDetails";
const TAB_TITLES = {
  overview: "Overview",
  cart: "My Cart",
  wishlist: "My Wishlist",
  orders: "My Orders",
  "order-details": "Order Details",
  settings: "Settings",
};

const TAB_SUBTITLES = {
  overview: "Welcome back! Here's what's happening.",
  cart: "Review and manage the items in your cart.",
  wishlist: "Products you've saved for later.",
  orders: "Track and manage all your orders.",
  "order-details": "See everything about this order.",
  settings: "Manage your account preferences and security.",
};

const UserDashboard = memo(() => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [orderDetailsId, setOrderDetailsId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  // Active tab shown in the header (orders detail gets its own title)
  const headerTab = orderDetailsId ? "order-details" : activeTab;

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#050507] text-white">
      {/* Sidebar */}
      <UserSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#050507]/80 px-4 backdrop-blur-xl sm:px-6">
          {/* Left: mobile menu + branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-zinc-400 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
              aria-label="Toggle sidebar"
            >
              <FiMenu size={20} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 lg:hidden">
                <svg
                  width="18"
                  height="18"
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
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              onClick={() =>
                handleThemeChange(theme === "dark" ? "light" : "dark")
              }
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Notifications */}
            <button
              className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Notifications"
            >
              <FiBell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-[#050507]" />
            </button>

            {/* Profile — redux user থেকে dynamic */}
            <button className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5 pr-3 transition hover:bg-white/[0.08]">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-violet-500/40"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-600/20 text-xs font-bold text-violet-300 ring-2 ring-violet-500/40">
                  {(user?.name || "U").trim().charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden text-sm font-semibold text-white sm:block">
                {user?.name || "User"}
              </span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {TAB_TITLES[headerTab]}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {TAB_SUBTITLES[headerTab]}
            </p>
          </div>

          {/* Tab content */}
          {activeTab === "overview" && <Overview />}
          {activeTab === "cart" && <Cart />}
          {activeTab === "wishlist" && <Wishlist />}
          {activeTab === "orders" &&
            (orderDetailsId ? (
              <OrderDetails
                orderId={orderDetailsId}
                onBack={() => setOrderDetailsId(null)}
              />
            ) : (
              <Orders onViewOrder={setOrderDetailsId} />
            ))}
          {activeTab === "settings" && (
            <Settings theme={theme} onThemeChange={handleThemeChange} />
          )}
        </main>
      </div>
    </div>
  );
});

UserDashboard.displayName = "UserDashboard";

export default UserDashboard;

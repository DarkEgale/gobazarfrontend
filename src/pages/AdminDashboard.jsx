import { memo, useState } from "react";
import { useSelector } from "react-redux";
import { FiMenu, FiBell, FiMoon, FiSun } from "react-icons/fi";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminOverview from "../components/admin/AdminOverview";
import AdminProducts from "../components/admin/AdminProducts";
import AdminOrders from "../components/admin/AdminOrders";
import AdminCustomers from "../components/admin/AdminCustomers";
import AdminSettings from "../components/admin/AdminSettings";

const TAB_TITLES = {
  overview: "Dashboard Overview",
  products: "Products Management",
  orders: "Orders Management",
  customers: "Customers Management",
  settings: "Admin Settings",
};

const TAB_SUBTITLES = {
  overview: "Welcome back, Admin! Here's what's happening in your store.",
  products: "Create, update and manage all your products.",
  orders: "Track and manage all customer orders.",
  customers: "View and manage your registered customers.",
  settings: "Configure your store preferences and security.",
};

const AdminDashboard = memo(() => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  return (
    <div className="flex min-h-screen bg-[#050507] text-white">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#050507]/80 px-4 backdrop-blur-xl sm:px-6">
          {/* Left: mobile menu + branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
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
                <span className="ml-1.5 hidden rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300 ring-1 ring-violet-500/30 sm:inline">
                  Admin
                </span>
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              onClick={() =>
                setTheme((prev) => (prev === "dark" ? "light" : "dark"))
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

            {/* Admin profile — redux user থেকে dynamic */}
            <button className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5 pr-3 transition hover:bg-white/[0.08]">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Admin"
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-violet-500/40"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-600/20 text-xs font-bold text-violet-300 ring-2 ring-violet-500/40">
                  {(user?.name || "A").trim().charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden text-sm font-semibold text-white sm:block">
                {user?.name || "Admin"}
              </span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {TAB_TITLES[activeTab]}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {TAB_SUBTITLES[activeTab]}
            </p>
          </div>

          {/* Tab content */}
          {activeTab === "overview" && <AdminOverview />}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "customers" && <AdminCustomers />}
          {activeTab === "settings" && <AdminSettings />}
        </main>
      </div>
    </div>
  );
});

AdminDashboard.displayName = "AdminDashboard";

export default AdminDashboard;

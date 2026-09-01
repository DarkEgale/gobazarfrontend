import { memo, useState } from "react";
import { useSelector } from "react-redux";
import { FiSave, FiBell, FiSettings, FiUser, FiMoon } from "react-icons/fi";

const AdminSettings = memo(() => {
  const { user } = useSelector((state) => state.auth);
  const [settings, setSettings] = useState({
    storeName: "GoBazar",
    storeEmail: "admin@gobazar.com",
    currency: "USD",
    taxRate: 10,
    shippingRate: 5,
    lowStockThreshold: 10,
    orderPrefix: "#ORD",
    productPrefix: "#PRD",
    customerPrefix: "#CUS",
    dateFormat: "MM/DD/YYYY",
    timezone: "America/Los_Angeles",
  });
  const [activeTab, setActiveTab] = useState("general");
  const [notificationEnabled, setNotificationEnabled] = useState({
    orderUpdates: true,
    lowStockAlerts: true,
    newOrderAlerts: true,
  });

  const TABS = [
    { id: "general", label: "General", icon: FiSettings },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "appearance", label: "Appearance", icon: FiMoon },
    { id: "profile", label: "Profile", icon: FiUser },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Saving settings", settings);
  };

  const toggleNotification = (key) => {
    setNotificationEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const inputClasses =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30";

  const toggleClasses = (active) =>
    `relative h-6 w-11 rounded-full transition ${
      active ? "bg-emerald-500" : "bg-zinc-600"
    }`;

  const knobClasses = (active) =>
    `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
      active ? "right-[22px]" : "left-0.5"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Settings
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your store preferences and configurations
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-violet-600/40"
        >
          <FiSave size={16} />
          Save Changes
        </button>
      </div>

      {/* Settings tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeTab === id
                ? "bg-white/[0.06] text-white ring-1 ring-white/[0.1]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        {activeTab === "general" && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    storeName: e.target.value,
                  }))
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Store Email
              </label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    storeEmail: e.target.value,
                  }))
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Currency
              </label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, currency: e.target.value }))
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    taxRate: parseInt(e.target.value) || 0,
                  }))
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Shipping Rate
              </label>
              <input
                type="number"
                value={settings.shippingRate}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    shippingRate: parseInt(e.target.value) || 0,
                  }))
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    lowStockThreshold: parseInt(e.target.value) || 0,
                  }))
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Order ID Prefix
              </label>
              <input
                type="text"
                value={settings.orderPrefix}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    orderPrefix: e.target.value,
                  }))
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Product ID Prefix
              </label>
              <input
                type="text"
                value={settings.productPrefix}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    productPrefix: e.target.value,
                  }))
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Customer ID Prefix
              </label>
              <input
                type="text"
                value={settings.customerPrefix}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    customerPrefix: e.target.value,
                  }))
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Date Format
              </label>
              <input
                type="text"
                value={settings.dateFormat}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    dateFormat: e.target.value,
                  }))
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Timezone
              </label>
              <input
                type="text"
                value={settings.timezone}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, timezone: e.target.value }))
                }
                className={inputClasses}
              />
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div>
                <p className="text-sm font-medium text-white">Order Updates</p>
                <p className="text-xs text-zinc-500">
                  Receive email notifications for order updates
                </p>
              </div>
              <button
                onClick={() => toggleNotification("orderUpdates")}
                className={toggleClasses(notificationEnabled.orderUpdates)}
                aria-label="Toggle order updates"
              >
                <span
                  className={knobClasses(notificationEnabled.orderUpdates)}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div>
                <p className="text-sm font-medium text-white">
                  Low Stock Alerts
                </p>
                <p className="text-xs text-zinc-500">
                  Notify me when products run low
                </p>
              </div>
              <button
                onClick={() => toggleNotification("lowStockAlerts")}
                className={toggleClasses(notificationEnabled.lowStockAlerts)}
                aria-label="Toggle low stock alerts"
              >
                <span
                  className={knobClasses(notificationEnabled.lowStockAlerts)}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div>
                <p className="text-sm font-medium text-white">New Orders</p>
                <p className="text-xs text-zinc-500">
                  Get notified when new orders are placed
                </p>
              </div>
              <button
                onClick={() => toggleNotification("newOrderAlerts")}
                className={toggleClasses(notificationEnabled.newOrderAlerts)}
                aria-label="Toggle new order alerts"
              >
                <span
                  className={knobClasses(notificationEnabled.newOrderAlerts)}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div>
                <p className="text-sm font-medium text-white">Dark Mode</p>
                <p className="text-xs text-zinc-500">
                  Toggle dark mode for the admin panel
                </p>
              </div>
              <button
                onClick={() => toggleSetting("darkMode")}
                className={toggleClasses(settings.darkMode)}
                aria-label="Toggle dark mode"
              >
                <span className={knobClasses(settings.darkMode)} />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div>
                <p className="text-sm font-medium text-white">Reduce Motion</p>
                <p className="text-xs text-zinc-500">
                  Minimize animations across the dashboard
                </p>
              </div>
              <button
                onClick={() => toggleSetting("reduceMotion")}
                className={toggleClasses(settings.reduceMotion)}
                aria-label="Toggle reduce motion"
              >
                <span className={knobClasses(settings.reduceMotion)} />
              </button>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Admin"
                className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-violet-500/40"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 text-xl font-bold text-violet-300 ring-1 ring-violet-500/30">
                {(user?.name || "A").trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-zinc-500">
                {user?.email || "admin@gobazar.com"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

AdminSettings.displayName = "AdminSettings";

export default AdminSettings;

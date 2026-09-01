import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, uploadAvatar } from "../../store/slices/authSlice";
import {
    FiUser,
    FiShield,
    // FiPalette,
    FiCamera,
    FiMoon,
    FiSun,
    FiSave,
    FiKey,
    FiEye,
    FiEyeOff,
    FiCheck,
} from "react-icons/fi";

const SETTING_TABS = [
    { id: "profile", label: "Personal Info", icon: FiUser },
    { id: "security", label: "Security", icon: FiShield },
    { id: "theme", label: "Theme", icon:"d" },
];

const PersonalInfo = memo(() => {
    const dispatch = useDispatch();
    const { user, loading, message, error } = useSelector((state) => state.auth);

    const [form, setForm] = useState({ name: "", email: "" });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    // redux user থেকে form sync (login/logout/avatar update সব ক্ষেত্রে)
    useEffect(() => {
        if (user) {
            setForm({ name: user.name || "", email: user.email || "" });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (form.name.trim().length < 2) {
            alert("Name must be at least 2 characters");
            return;
        }
        dispatch(updateProfile({ name: form.name.trim() }));
    };

    // Avatar select করতেই backend-এ upload হবে — সফল হলে redux user update হবে
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }
        setUploading(true);
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(URL.createObjectURL(file));
        try {
            const fd = new FormData();
            fd.append("avatar", file);
            await dispatch(uploadAvatar(fd)).unwrap();
        } catch {
            // error redux state-এ চলে যায়, নিচে দেখানো হবে
        } finally {
            setUploading(false);
        }
    };

    const avatarSrc = avatarPreview || user?.avatar || null;
    const initial = (user?.name || "U").trim().charAt(0).toUpperCase();

    return (
        <div className="space-y-6">
            {/* Profile image */}
            <div className="flex items-center gap-5">
                <div className="relative">
                    {avatarSrc ? (
                        <img
                            src={avatarSrc}
                            alt="Profile"
                            className={`h-20 w-20 rounded-2xl object-cover ring-2 ring-violet-500/40 ${uploading ? "opacity-60" : ""}`}
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 text-2xl font-bold text-violet-300 ring-2 ring-violet-500/40">
                            {initial}
                        </div>
                    )}
                    <label
                        htmlFor="profile-upload"
                        className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 transition-transform hover:scale-110"
                    >
                        <FiCamera size={14} />
                        <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white">Profile Photo</h4>
                    <p className="mt-1 text-xs text-zinc-500">
                        {uploading ? "Uploading..." : "Upload a new photo to update your profile"}
                    </p>
                </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-[13px] font-semibold text-zinc-300">
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-[13px] font-semibold text-zinc-300">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        disabled
                        className="h-11 w-full cursor-not-allowed rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-zinc-500 opacity-70 outline-none"
                    />
                    <p className="mt-1 text-[11px] text-zinc-600">
                        Email পরিবর্তন করা যায় না (security কারণে)
                    </p>
                </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
            {message && !error && <p className="text-xs text-emerald-400">{message}</p>}

            <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-violet-600/40 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
            >
                <FiSave size={16} />
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </div>
    );
});

PersonalInfo.displayName = "PersonalInfo";

const Security = memo(() => {
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const togglePassword = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const PasswordField = ({ label, name, placeholder }) => (
        <div>
            <label className="mb-2 block text-[13px] font-semibold text-zinc-300">
                {label}
            </label>
            <div className="relative">
                <input
                    type={showPasswords[name] ? "text" : "password"}
                    name={name}
                    value={passwords[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 pr-11 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10"
                />
                <button
                    type="button"
                    onClick={() => togglePassword(name)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-400"
                    aria-label={`Toggle ${label} visibility`}
                >
                    {showPasswords[name] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
                <FiKey size={18} className="mt-0.5 shrink-0 text-amber-400" />
                <p className="text-xs leading-5 text-amber-200/80">
                    Use a strong password with at least 8 characters, including numbers
                    and special characters.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <PasswordField
                    label="Current Password"
                    name="current"
                    placeholder="Enter current password"
                />
                <PasswordField
                    label="New Password"
                    name="new"
                    placeholder="Enter new password"
                />
                <PasswordField
                    label="Confirm New Password"
                    name="confirm"
                    placeholder="Confirm new password"
                />
            </div>

            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-violet-600/40 active:translate-y-0">
                <FiShield size={16} />
                Update Password
            </button>
        </div>
    );
});

Security.displayName = "Security";

const ThemeSettings = memo(({ theme, onThemeChange }) => {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-bold text-white">Appearance</h4>
                <p className="mt-1 text-xs text-zinc-500">
                    Choose how GoBazar looks to you
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Dark theme */}
                <button
                    onClick={() => onThemeChange("dark")}
                    className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${theme === "dark"
                        ? "border-violet-500/50 bg-violet-500/[0.08] ring-2 ring-violet-500/30"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15]"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a0a0f] text-violet-400 ring-1 ring-white/[0.1]">
                            <FiMoon size={18} />
                        </div>
                        {theme === "dark" && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white">
                                <FiCheck size={12} />
                            </span>
                        )}
                    </div>
                    <h5 className="mt-4 text-sm font-bold text-white">Dark Mode</h5>
                    <p className="mt-1 text-xs text-zinc-500">
                        Easy on the eyes, perfect for night
                    </p>
                </button>

                {/* Light theme */}
                <button
                    onClick={() => onThemeChange("light")}
                    className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${theme === "light"
                        ? "border-violet-500/50 bg-violet-500/[0.08] ring-2 ring-violet-500/30"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15]"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-500 ring-1 ring-amber-200">
                            <FiSun size={18} />
                        </div>
                        {theme === "light" && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white">
                                <FiCheck size={12} />
                            </span>
                        )}
                    </div>
                    <h5 className="mt-4 text-sm font-bold text-white">Light Mode</h5>
                    <p className="mt-1 text-xs text-zinc-500">
                        Bright and clean, perfect for day
                    </p>
                </button>
            </div>
        </div>
    );
});

ThemeSettings.displayName = "ThemeSettings";

const Settings = memo(({ theme, onThemeChange }) => {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
            {/* Settings sidebar */}
            <div className="h-fit rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 lg:sticky lg:top-6">
                <p className="mb-2 px-3 pt-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-zinc-600">
                    Settings
                </p>

                <div className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-1.5">
                    {SETTING_TABS.map(({ id, label, icon: Icon }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-300 ring-1 ring-violet-500/30"
                                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                                    }`}
                            >
                                <Icon
                                    size={17}
                                    className={isActive ? "text-violet-400" : "text-zinc-600"}
                                />
                                <span className="whitespace-nowrap">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Settings content */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 sm:p-6">
                {activeTab === "profile" && <PersonalInfo />}
                {activeTab === "security" && <Security />}
                {activeTab === "theme" && (
                    <ThemeSettings theme={theme} onThemeChange={onThemeChange} />
                )}
            </div>
        </div>
    );
});

Settings.displayName = "Settings";

export default Settings;
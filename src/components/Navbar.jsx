import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { selectCartCount } from "../store/slices/cartSlice";
import { logoutUser } from "../store/slices/authSlice";

const Navbar = ({ onSearch }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        {/* Branding */}
        <Link to="/" className="group flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 transition-transform duration-300 group-hover:scale-110">
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
          <span className="text-xl font-bold tracking-tight">
            Go
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Bazar
            </span>
          </span>
        </Link>

        {/* Search Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="group relative hidden max-w-[480px] flex-1 md:block"
        >
          <div className="flex h-[44px] items-center rounded-xl border border-white/[0.08] bg-[#0d0d12] transition-all duration-200 focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/10 hover:border-white/[0.12]">
            <div className="pl-4 text-zinc-600 transition-colors group-focus-within:text-violet-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, categories..."
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-zinc-600"
            />
            <button
              type="submit"
              className="mr-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:opacity-90"
            >
              Search
            </button>
          </div>
        </form>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dashboard Button */}
          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0d0d12] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-all duration-200 hover:border-violet-500/30 hover:text-violet-300 sm:flex"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-white/[0.08] bg-[#0d0d12] text-zinc-300 transition-all duration-200 hover:border-violet-500/30 hover:text-violet-300"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[10px] font-bold text-white shadow-lg shadow-violet-600/30">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0d0d12] p-1.5 pr-3 transition-all duration-200 hover:border-violet-500/30"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="hidden max-w-[100px] truncate text-sm font-semibold text-zinc-300 lg:block">
                  {user.name?.split(" ")[0]}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-zinc-500 transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-[52px] w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d12] shadow-2xl shadow-black/50 backdrop-blur-xl">
                  <div className="border-b border-white/[0.06] px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {user.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-violet-300"
                    >
                      <User size={15} />
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-violet-300"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-violet-600/40"
            >
              <User size={16} />
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t border-white/[0.06] px-5 py-3 md:hidden">
        <form onSubmit={handleSearchSubmit} className="group relative">
          <div className="flex h-[40px] items-center rounded-xl border border-white/[0.08] bg-[#0d0d12]">
            <div className="pl-3 text-zinc-600">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-zinc-600"
            />
            <button
              type="submit"
              className="mr-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default Navbar;

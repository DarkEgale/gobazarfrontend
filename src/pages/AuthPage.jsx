import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  loginUser,
  registerUser,
  googleLogin,
  clearError,
} from "../store/slices/authSlice";

const GOOGLE_CLIENT_ID =
  "282460231681-i28cr1egpkv5bmuia9b77nejuf0oc5u8.apps.googleusercontent.com";

export default function AuthPage() {
  const googleRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth,
  );
  const location = useLocation();

  const isLogin = mode === "login";

  useEffect(() => {
    if (user && !user.isVerified) {
      navigate("/verify-email");
    } else if (isAuthenticated) {
      // Protected route থেকে এসে থাকলে আগের পেজে ফেরত, নাহলে role অনুযায়ী
      const from = location.state?.from;
      if (from) {
        navigate(from, { replace: true });
      } else if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
    return () => dispatch(clearError());
  }, [isAuthenticated, user, navigate, dispatch, location.state, location.pathname]);

  // Google Login
  useEffect(() => {
    if (!window.google || !googleRef.current) return;

    googleRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,

      callback: async (response) => {
        dispatch(googleLogin(response.credential));
      },
    });

    window.google.accounts.id.renderButton(googleRef.current, {
      theme: "outline",
      size: "large",
      width: 360,
      text: "continue_with",
      shape: "rectangular",
    });
  }, [mode, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (isLogin) {
      dispatch(loginUser({ email: data.email, password: data.password }));
    } else {
      dispatch(
        registerUser({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] animate-pulse rounded-full bg-violet-600/15 blur-[120px]" />
        <div
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse rounded-full bg-indigo-600/15 blur-[120px]"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Main container */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 sm:px-8 lg:px-12">
        {/* ================= HEADER ================= */}

        <header className="flex h-[80px] shrink-0 items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 transition-transform duration-300 group-hover:scale-110">
              <svg
                width="22"
                height="22"
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

          <div className="hidden text-sm text-zinc-400 sm:block">
            {isLogin ? "New here?" : "Already have an account?"}

            <button
              type="button"
              onClick={() => setMode(isLogin ? "register" : "login")}
              className="ml-2 font-semibold text-violet-400 transition hover:text-violet-300"
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>
        </header>

        {/* ================= CONTENT ================= */}

        <main className="flex flex-1 items-center py-10 lg:py-16">
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_520px] lg:gap-20 xl:gap-28">
            {/* ================= LEFT SIDE ================= */}

            <section className="hidden lg:block">
              <div className="max-w-[650px]">
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 backdrop-blur-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-500"></span>
                  </span>

                  <span className="text-sm font-semibold text-violet-300">
                    The smarter way to shop
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-[60px] font-extrabold leading-[1.05] tracking-[-2.5px] xl:text-[72px]">
                  Find Everything.
                  <br />
                  Sell{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                      Anything.
                    </span>
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      viewBox="0 0 300 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 8C50 4 150 2 298 6"
                        stroke="url(#paint0_linear)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear"
                          x1="0"
                          y1="6"
                          x2="298"
                          y2="6"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#8B5CF6" />
                          <stop offset="0.5" stopColor="#D946EF" />
                          <stop offset="1" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </h1>

                <p className="mt-8 max-w-[580px] text-lg leading-8 text-zinc-400">
                  Discover products, connect with trusted sellers, and
                  experience a better way to buy and sell online.
                </p>

                {/* Feature cards */}
                <div className="mt-12 grid grid-cols-3 gap-4">
                  <FeatureCard
                    icon={
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    }
                    title="Secure"
                    description="Protected"
                  />

                  <FeatureCard
                    icon={
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    }
                    title="Fast"
                    description="Simple"
                  />

                  <FeatureCard
                    icon={
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    }
                    title="Trusted"
                    description="Community"
                  />
                </div>

                {/* Stats */}
                <div className="mt-14 flex items-center gap-10 border-t border-white/[0.08] pt-8">
                  <Stat value="50K+" label="Listings" />
                  <Stat value="20K+" label="Users" />
                  <Stat value="4.8/5" label="Rating" />
                </div>
              </div>
            </section>

            {/* ================= AUTH ================= */}

            <section className="w-full">
              <div className="mx-auto w-full max-w-[480px]">
                <div className="relative rounded-[32px] border border-white/[0.1] bg-[#0a0a0f]/80 p-8 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-10">
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 rounded-[32px] bg-gradient-to-r from-violet-500/20 to-indigo-500/20 opacity-50 blur-xl" />

                  {/* Content */}
                  <div className="relative">
                    {/* Icon */}
                    <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-violet-400 ring-1 ring-violet-500/30">
                      {isLogin ? (
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                          <path d="m10 17 5-5-5-5" />
                          <path d="M15 12H3" />
                        </svg>
                      ) : (
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" x2="19" y1="8" y2="14" />
                          <line x1="22" x2="16" y1="11" y2="11" />
                        </svg>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-[32px] font-bold tracking-tight">
                      {isLogin ? "Welcome back" : "Create your account"}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {isLogin
                        ? "Sign in to continue to your GoBazar account."
                        : "Create your account and start using GoBazar."}
                    </p>

                    {/* ================= TOGGLE ================= */}

                    <div className="mt-8 grid h-[52px] grid-cols-2 rounded-2xl border border-white/[0.08] bg-[#0f0f14] p-1.5">
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className={`rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isLogin
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Login
                      </button>

                      <button
                        type="button"
                        onClick={() => setMode("register")}
                        className={`rounded-xl text-sm font-semibold transition-all duration-200 ${
                          !isLogin
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Register
                      </button>
                    </div>

                    {/* ================= FORM ================= */}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                      {/* Error Message */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                          {error}
                        </div>
                      )}

                      {/* NAME */}
                      {!isLogin && (
                        <div className="w-full">
                          <label className="mb-2.5 block text-[13px] font-semibold text-zinc-300">
                            Full Name
                          </label>
                          <div className="group flex h-[52px] w-full items-center rounded-xl border border-white/[0.08] bg-[#0f0f14] transition-all duration-200 focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/10 hover:border-white/[0.12]">
                            <div className="pl-4 text-zinc-600 transition-colors group-focus-within:text-violet-400">
                              <svg
                                width="19"
                                height="19"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <circle cx="9" cy="8" r="4" />
                                <path d="M3 21a6 6 0 0 1 12 0" />
                              </svg>
                            </div>
                            <input
                              name="name"
                              type="text"
                              required
                              placeholder="Enter your full name"
                              className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] text-white outline-none placeholder:text-zinc-600"
                            />
                          </div>
                        </div>
                      )}

                      {/* EMAIL */}
                      <div className="w-full">
                        <label className="mb-2.5 block text-[13px] font-semibold text-zinc-300">
                          Email Address
                        </label>
                        <div className="group flex h-[52px] w-full items-center rounded-xl border border-white/[0.08] bg-[#0f0f14] transition-all duration-200 focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/10 hover:border-white/[0.12]">
                          <div className="pl-4 text-zinc-600 transition-colors group-focus-within:text-violet-400">
                            <svg
                              width="19"
                              height="19"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <rect x="3" y="5" width="18" height="14" rx="2" />
                              <path d="m3 7 9 6 9-6" />
                            </svg>
                          </div>
                          <input
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] text-white outline-none placeholder:text-zinc-600"
                          />
                        </div>
                      </div>

                      {/* PASSWORD */}
                      <div className="w-full">
                        <label className="mb-2.5 block text-[13px] font-semibold text-zinc-300">
                          Password
                        </label>
                        <div className="group flex h-[52px] w-full items-center rounded-xl border border-white/[0.08] bg-[#0f0f14] transition-all duration-200 focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/10 hover:border-white/[0.12]">
                          <div className="pl-4 text-zinc-600 transition-colors group-focus-within:text-violet-400">
                            <svg
                              width="19"
                              height="19"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <rect
                                x="5"
                                y="10"
                                width="14"
                                height="10"
                                rx="2"
                              />
                              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                            </svg>
                          </div>
                          <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Enter your password"
                            className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] text-white outline-none placeholder:text-zinc-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="mr-3 shrink-0 px-2 py-1 text-xs font-semibold text-zinc-500 transition hover:text-violet-400"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      {/* CONFIRM PASSWORD */}
                      {!isLogin && (
                        <div className="w-full">
                          <label className="mb-2.5 block text-[13px] font-semibold text-zinc-300">
                            Confirm Password
                          </label>
                          <div className="group flex h-[52px] w-full items-center rounded-xl border border-white/[0.08] bg-[#0f0f14] transition-all duration-200 focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/10 hover:border-white/[0.12]">
                            <div className="pl-4 text-zinc-600 transition-colors group-focus-within:text-violet-400">
                              <svg
                                width="19"
                                height="19"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <rect
                                  x="5"
                                  y="10"
                                  width="14"
                                  height="10"
                                  rx="2"
                                />
                                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                              </svg>
                            </div>
                            <input
                              name="confirmPassword"
                              type={showConfirm ? "text" : "password"}
                              required
                              placeholder="Confirm your password"
                              className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] text-white outline-none placeholder:text-zinc-600"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="mr-3 shrink-0 px-2 py-1 text-xs font-semibold text-zinc-500 transition hover:text-violet-400"
                            >
                              {showConfirm ? "Hide" : "Show"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* LOGIN OPTIONS */}
                      {isLogin && (
                        <div className="flex items-center justify-between">
                          <label className="flex cursor-pointer items-center gap-2.5 text-xs text-zinc-400">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-violet-500"
                            />
                            Remember me
                          </label>

                          <Link
                            to="/forgot-password"
                            className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
                          >
                            Forgot password?
                          </Link>
                        </div>
                      )}

                      {/* REGISTER TERMS */}
                      {!isLogin && (
                        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-zinc-400">
                          <input
                            type="checkbox"
                            required
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-700 bg-zinc-900 accent-violet-500"
                          />

                          <span>
                            I agree to GoBazar's{" "}
                            <Link
                              to="/terms"
                              className="text-violet-400 transition hover:text-violet-300"
                            >
                              Terms
                            </Link>{" "}
                            and{" "}
                            <Link
                              to="/privacy"
                              className="text-violet-400 transition hover:text-violet-300"
                            >
                              Privacy Policy
                            </Link>
                          </span>
                        </label>
                      )}

                      {/* SUBMIT */}

                      <button
                        type="submit"
                        disabled={loading}
                        className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold shadow-lg shadow-violet-600/30 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-xl hover:shadow-violet-600/40 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading
                          ? "Please wait..."
                          : isLogin
                            ? "Login to GoBazar"
                            : "Create Account"}

                        {!loading && (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="transition-transform duration-200 group-hover:translate-x-1"
                          >
                            <path d="M5 12h14" />
                            <path d="m13 6 6 6-6 6" />
                          </svg>
                        )}
                      </button>
                    </form>

                    {/* ================= DIVIDER ================= */}

                    <div className="my-8 flex items-center gap-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

                      <span className="shrink-0 text-[11px] uppercase tracking-[1.5px] text-zinc-600">
                        OR CONTINUE WITH
                      </span>

                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
                    </div>

                    {/* ================= GOOGLE ================= */}

                    <div className="flex w-full justify-center overflow-hidden rounded-xl">
                      <div
                        ref={googleRef}
                        className="min-h-[44px] max-w-full"
                      />
                    </div>

                    {/* ================= BOTTOM ================= */}

                    <p className="mt-8 text-center text-xs text-zinc-500">
                      {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}

                      <button
                        type="button"
                        onClick={() => setMode(isLogin ? "register" : "login")}
                        className="ml-1.5 font-semibold text-violet-400 transition hover:text-violet-300"
                      >
                        {isLogin ? "Create one" : "Sign in"}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Mobile copyright */}

        <footer className="pb-5 text-center text-xs text-zinc-700 lg:hidden">
          © {new Date().getFullYear()} GoBazar
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all duration-300 hover:border-violet-500/30 hover:bg-violet-500/[0.05] hover:shadow-lg hover:shadow-violet-500/10">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-violet-400 ring-1 ring-violet-500/30 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>

      <h3 className="text-sm font-bold text-white">{title}</h3>

      <p className="mt-1.5 text-xs text-zinc-500">{description}</p>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>

      <p className="mt-1.5 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

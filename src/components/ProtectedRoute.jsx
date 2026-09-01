import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * ProtectedRoute — login না করা user কে /login এ পাঠিয়ে দেয়।
 * App load-এর সময় /auth/me দিয়ে session restore হয় (bootstrapped flag),
 * তাই restore শেষ না হওয়া পর্যন্ত loader দেখানো হয় — নাহলে
 * reload করলেই ভুলভাবে login page-এ চলে যেত।
 */
export const ProtectedRoute = () => {
    const { isAuthenticated, bootstrapped } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!bootstrapped) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#050507]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                    <p className="text-sm text-zinc-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // কোথা থেকে এসেছে মনে রাখা হলো — login-এর পর ফিরে আসার জন্য
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Outlet />;
};

/**
 * AdminRoute — শুধু role === 'admin' user ঢুকতে পারবে।
 * বাকিরা (user/anonymous) dashboard-এ পাঠানো হবে।
 */
export const AdminRoute = () => {
    const { user, isAuthenticated, bootstrapped } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!bootstrapped) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#050507]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                    <p className="text-sm text-zinc-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (user?.role !== "admin") {
        // Non-admin user কে dashboard-এ পাঠিয়ে দেওয়া
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

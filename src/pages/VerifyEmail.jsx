import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { resendEmailOtp, verifyEmail } from "../store/slices/authSlice";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [counter, setCounter] = useState(60);
  const dispatch = useDispatch();

  // Countdown
  useEffect(() => {
    if (counter <= 0) return;

    const timer = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [counter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError("");

    try {
      const response = await dispatch(verifyEmail(otp)).unwrap();
      const user = response.data.user;

      if (user.isVerified === true) {
        setIsVerified(true);
      } else {
        setError("Invalid or expired OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying email:", error);

      setError(
        error.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (counter > 0) return;

    try {
      await dispatch(resendEmailOtp()).unwrap();

      setCounter(60);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {!isVerified ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">
                  Verify Your Email
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Enter the verification code sent to your email
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Verification Code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-center text-lg tracking-[0.4em] text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length === 0}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Verifying..." : "Verify Email"}
                </button>

                {/* Resend OTP */}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={counter > 0}
                  className="w-full text-sm text-blue-400 hover:text-blue-300 disabled:cursor-not-allowed disabled:text-gray-500"
                >
                  {counter > 0 ? `Resend Code in ${counter}s` : "Resend Code"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-500">
                The verification code will expire after a limited time.
              </p>
            </>
          ) : (
            <div className="py-8 text-center">
              <h2 className="text-2xl font-bold text-white">Email Verified!</h2>

              <p className="mt-3 text-gray-400">
                Your email has been successfully verified.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

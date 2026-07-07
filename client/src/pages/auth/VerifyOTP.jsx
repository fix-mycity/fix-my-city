import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../../features/auth/authThunks";
import {
  getBackendFieldErrors,
  getGlobalErrorMessage,
} from "../../utils/authErrorUtils";

export default function VerifyOTP() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, registeredEmail } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!registeredEmail) {
      navigate("/register");
    }
  }, [registeredEmail, navigate]);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);

    if (fieldErrors.otp) {
      setFieldErrors((prev) => ({
        ...prev,
        otp: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!otp.trim()) {
      errors.otp = "OTP code is required.";
    } else if (!/^\d{6}$/.test(otp)) {
      errors.otp = "Please enter a valid 6-digit OTP code.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await dispatch(verifyOtp({ email: registeredEmail, otp })).unwrap();
      toast.success("Email verified successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      const { errors, globalMessages } = getBackendFieldErrors(err, ["otp"]);

      if (Object.keys(errors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
      }

      if (globalMessages.length > 0) {
        globalMessages.forEach((message) => toast.error(message));
      } else {
        const errorMsg = errors.otp || getGlobalErrorMessage(err, "OTP verification failed.");
        toast.error(errorMsg);
      }
    }
  };

  const handleResend = async () => {
    try {
      await dispatch(resendOtp({ email: registeredEmail })).unwrap();
      toast.success("OTP code sent successfully!");
      setCooldown(30);
    } catch (err) {
      toast.error(getGlobalErrorMessage(err, "Failed to resend OTP."));
    }
  };

  return (
    <div className="bg-background min-h-screen flex text-on-surface">
      <div className="w-full bg-surface-container-lowest flex flex-col justify-center items-center p-4 shadow-[-20px_0_40px_rgba(26,54,93,0.05)] z-10">
        <div className="w-full max-w-md">
          <div className="mb-5 text-center">
            <h2 className="font-headline-kpi text-headline-kpi text-text-primary mb-1">
              Verify Your Account
            </h2>
            <p className="font-body-md text-body-md text-text-muted">
              We've sent a 6-digit code to your email.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="relative">
              <label
                htmlFor="otp"
                className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted"
              >
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength="6"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                className={`w-full h-11 px-4 text-center tracking-[0.5em] border rounded bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none input-glow transition-all ${
                  fieldErrors.otp ? "border-red-500 focus:border-red-500" : "border-outline-variant"
                }`}
              />
              {fieldErrors.otp && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm tracking-normal">
                  {fieldErrors.otp}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full h-11 font-title-lg text-title-lg rounded transition-all btn-glow mt-4 bg-primary-container text-on-primary disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="mt-4 text-center font-body-md text-body-md text-text-muted text-sm">
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || status === "loading"}
              className="text-text-primary font-bold hover:underline ml-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

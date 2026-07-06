import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { registerUser } from "../../features/auth/authThunks";
import {
  INDIA_DISTRICTS_BY_STATE,
  INDIA_STATES,
} from "../../data/indiaLocations";

const FIELD_NAMES = new Set([
  "username",
  "email",
  "state",
  "district",
  "pincode",
  "password",
  "confirm_password",
  "terms",
]);

const cleanBackendMessage = (message) =>
  String(message || "Invalid value.").replace(/^Value error,\s*/i, "");

const getBackendFieldErrors = (error) => {
  const detail = error?.detail ?? error;
  const errors = {};
  const globalMessages = [];

  if (Array.isArray(detail)) {
    detail.forEach((item) => {
      let fieldName;
      for (let index = (item.loc?.length || 0) - 1; index >= 0; index -= 1) {
        if (FIELD_NAMES.has(item.loc[index])) {
          fieldName = item.loc[index];
          break;
        }
      }
      const message = cleanBackendMessage(item.msg || item.message);

      if (fieldName) {
        errors[fieldName] = message;
      } else {
        globalMessages.push(message);
      }
    });
  } else if (detail && typeof detail === "object") {
    Object.entries(detail).forEach(([fieldName, message]) => {
      if (FIELD_NAMES.has(fieldName)) {
        errors[fieldName] = cleanBackendMessage(message);
      }
    });
  }

  return { errors, globalMessages };
};

const getGlobalErrorMessage = (error) => {
  if (typeof error === "string") return error;
  if (typeof error?.detail === "string") return error.detail;
  if (typeof error?.message === "string") return error.message;
  return "Registration failed. Please try again.";
};

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    state: "",
    district: "",
    pincode: "",
    password: "",
    confirm_password: "",
  });

  // State to hold field-specific errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const selectedDistricts = INDIA_DISTRICTS_BY_STATE[formData.state] || [];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
      ...(name === "state" ? { district: "" } : {}),
    });

    // Clear the specific field error when the user starts typing again
    if (fieldErrors[name] || (name === "state" && fieldErrors.district)) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
        ...(name === "state" ? { district: "" } : {}),
      }));
    }
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);

    if (fieldErrors.terms) {
      setFieldErrors((prev) => ({
        ...prev,
        terms: "",
      }));
    }
  };

  // --- Client-Side Validation Logic ---
  const validateForm = () => {
    const errors = {};
    const {
      username,
      email,
      state,
      district,
      pincode,
      password,
      confirm_password,
    } = formData;

    if (!username.trim()) {
      errors.username = "Username is required.";
    } else if (username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (username.trim().length > 50) {
      errors.username = "Username must be 50 characters or less.";
    }

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!state.trim()) {
      errors.state = "State is required.";
    }

    if (!district.trim()) {
      errors.district = "District is required.";
    } else if (!INDIA_DISTRICTS_BY_STATE[state]?.includes(district)) {
      errors.district = "Please select a valid district for the selected state.";
    }

    if (!pincode.trim()) {
      errors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(pincode)) {
      errors.pincode = "Please enter a valid 6-digit pincode.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!confirm_password) {
      errors.confirm_password = "Please confirm your password.";
    } else if (password !== confirm_password) {
      errors.confirm_password = "Passwords do not match.";
    }

    if (!termsAccepted) {
      errors.terms = "Please accept the terms and privacy policy.";
    }

    setFieldErrors(errors);

    // Return true if there are no errors (errors object is empty)
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Run client-side validation first
    if (!validateForm()) return;

    try {
      // 2. Dispatch the thunk and use .unwrap()
      await dispatch(registerUser(formData)).unwrap();

      // 3. Handle success
      toast.success("Account created successfully!");
      navigate("/verify-otp");
    } catch (err) {
      console.error("Registration Backend Error:", err);

      const { errors, globalMessages } = getBackendFieldErrors(err);

      if (Object.keys(errors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
      }

      if (globalMessages.length > 0) {
        globalMessages.forEach((message) => toast.error(message));
      } else if (Object.keys(errors).length === 0) {
        toast.error(getGlobalErrorMessage(err));
      }
    }
  };

  return (
    <div className="bg-background min-h-screen flex text-on-surface">
      {/* Left Panel: Branding & Messaging */}
      <div className="hidden md:flex w-[45%] bg-primary-container flex-col justify-center items-center p-8 text-on-primary">
        <div className="max-w-md text-center flex flex-col items-center">
          <div className="mb-4">
            <svg
              fill="none"
              height="70"
              viewBox="0 0 80 80"
              width="70"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                fill="white"
                fillOpacity="0.1"
                height="80"
                rx="16"
                width="80"
              ></rect>
              <path
                d="M40 20L20 60H32L40 44L48 60H60L40 20Z"
                fill="white"
              ></path>
            </svg>
          </div>
          <h1 className="font-display-lg text-display-lg mb-2 text-on-primary">
            Join Fix My City
          </h1>
          <p className="font-body-md text-body-md text-on-primary-container text-lg">
            Report issues, track progress, and help improve your city.
          </p>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="w-full md:w-[55%] bg-surface-container-lowest flex flex-col justify-center items-center p-4 md:py-4 md:px-8 shadow-[-20px_0_40px_rgba(26,54,93,0.05)] z-10">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="md:hidden mb-4 text-center">
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-text-primary">
              Join Fix My City
            </h1>
          </div>

          {/* Form Header */}
          <div className="mb-5">
            <h2 className="font-headline-kpi text-headline-kpi text-text-primary mb-1">
              Create Account
            </h2>
            <p className="font-body-md text-body-md text-text-muted">
              Sign up to start reporting issues in your city
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="relative">
              <label
                htmlFor="username"
                className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className={`w-full h-11 px-4 border rounded bg-transparent font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all ${fieldErrors.username ? "border-red-500 focus:border-red-500" : "border-outline-variant"}`}
              />
              {fieldErrors.username && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <label
                htmlFor="email"
                className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full h-11 px-4 border rounded bg-transparent font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all ${fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-outline-variant"}`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* State & District Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative flex flex-col">
                <label
                  htmlFor="state"
                  className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted z-10"
                >
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full h-11 px-4 border rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all ${fieldErrors.state ? "border-red-500 focus:border-red-500" : "border-outline-variant"} ${!formData.state ? "text-text-muted" : ""}`}
                >
                  <option value="">Select state</option>
                  {INDIA_STATES.map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName}
                    </option>
                  ))}
                </select>
                {fieldErrors.state && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm">
                    {fieldErrors.state}
                  </p>
                )}
              </div>

              <div className="relative flex flex-col">
                <label
                  htmlFor="district"
                  className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted z-10"
                >
                  District
                </label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.state}
                  className={`w-full h-11 px-4 border rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed ${fieldErrors.district ? "border-red-500 focus:border-red-500" : "border-outline-variant"} ${!formData.district ? "text-text-muted" : ""}`}
                >
                  <option value="">
                    {formData.state ? "Select district" : "Select state first"}
                  </option>
                  {selectedDistricts.map((districtName) => (
                    <option key={districtName} value={districtName}>
                      {districtName}
                    </option>
                  ))}
                </select>
                {fieldErrors.district && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm">
                    {fieldErrors.district}
                  </p>
                )}
              </div>
            </div>

            {/* Pincode */}
            <div className="relative">
              <label
                htmlFor="pincode"
                className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted"
              >
                Pincode
              </label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                maxLength="6"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="000000"
                className={`w-full h-11 px-4 border rounded bg-transparent font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all ${fieldErrors.pincode ? "border-red-500 focus:border-red-500" : "border-outline-variant"}`}
              />
              {fieldErrors.pincode && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm">
                  {fieldErrors.pincode}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className={`w-full h-11 pl-4 pr-10 border rounded bg-transparent font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all tracking-[0.2em] ${fieldErrors.password ? "border-red-500 focus:border-red-500" : "border-outline-variant"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[22px] -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm tracking-normal">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••"
                className={`w-full h-11 pl-4 pr-10 border rounded bg-transparent font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all tracking-[0.2em] ${fieldErrors.confirm_password ? "border-red-500 focus:border-red-500" : "border-outline-variant"}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[22px] -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
              {fieldErrors.confirm_password && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm tracking-normal">
                  {fieldErrors.confirm_password}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={handleTermsChange}
                  className="w-4 h-4 border border-outline-variant rounded text-secondary-container focus:ring-secondary-container bg-transparent"
                />
              </div>
              <label
                htmlFor="terms"
                className="ml-2 font-body-md text-body-md text-text-muted text-sm"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-text-primary font-medium hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-text-primary font-medium hover:underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {fieldErrors.terms && (
              <p className="text-red-500 text-xs -mt-2 ml-6 font-body-sm">
                {fieldErrors.terms}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full h-11 font-title-lg text-title-lg rounded transition-all btn-glow mt-4 bg-primary-container text-on-primary disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Registering..." : "Create Account"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-4 text-center font-body-md text-body-md text-text-muted text-sm md:text-base">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-text-primary font-bold hover:underline ml-1"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

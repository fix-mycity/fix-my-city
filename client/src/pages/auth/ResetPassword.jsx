import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../../features/auth/authThunks';
import {
  getBackendFieldErrors,
  getGlobalErrorMessage,
} from '../../utils/authErrorUtils';

export default function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, forgotPasswordEmail } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    otp: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!forgotPasswordEmail) {
      navigate('/forgot-password');
    }
  }, [forgotPasswordEmail, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [e.target.name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.otp.trim()) {
      errors.otp = 'OTP code is required.';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      errors.otp = 'Please enter a valid 6-digit OTP code.';
    }

    if (!formData.new_password) {
      errors.new_password = 'New password is required.';
    } else if (formData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your password.';
    } else if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await dispatch(resetPassword({
        email: forgotPasswordEmail,
        otp: formData.otp,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      })).unwrap();

      toast.success("Password reset successfully! Please log in.");
      navigate('/login');
    } catch (err) {
      const { errors, globalMessages } = getBackendFieldErrors(err, [
        'otp',
        'new_password',
        'confirm_password',
      ]);

      if (Object.keys(errors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
      }

      if (globalMessages.length > 0) {
        globalMessages.forEach((message) => toast.error(message));
      } else {
        const errorMsg = errors.otp || errors.new_password || errors.confirm_password || getGlobalErrorMessage(err, 'Password reset failed.');
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="bg-background min-h-screen flex text-on-surface">
      {/* Left Panel: Branding & Messaging */}
      <div className="hidden md:flex w-[45%] bg-primary-container flex-col justify-center items-center p-8 text-on-primary">
        <div className="max-w-md text-center flex flex-col items-center">
          <div className="mb-4">
            <svg fill="none" height="70" viewBox="0 0 80 80" width="70" xmlns="http://www.w3.org/2000/svg">
              <rect fill="white" fillOpacity="0.1" height="80" rx="16" width="80"></rect>
              <path d="M40 20L20 60H32L40 44L48 60H60L40 20Z" fill="white"></path>
            </svg>
          </div>
          <h1 className="font-display-lg text-display-lg mb-2 text-on-primary">
            Fix My City
          </h1>
          <p className="font-body-md text-body-md text-on-primary-container text-lg">
            Secure your account to continue improving your city.
          </p>
        </div>
      </div>

      {/* Right Panel: Reset Password Form */}
      <div className="w-full md:w-[55%] bg-surface-container-lowest flex flex-col justify-center items-center p-4 md:py-4 md:px-8 shadow-[-20px_0_40px_rgba(26,54,93,0.05)] z-10">
        <div className="w-full max-w-md">
          
          <div className="mb-5">
            <h2 className="font-headline-kpi text-headline-kpi text-text-primary mb-1">
              Set New Password
            </h2>
            <p className="font-body-md text-body-md text-text-muted">
              Enter the code sent to <strong>{forgotPasswordEmail}</strong> and choose a new password.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>

            {/* OTP */}
            <div className="relative">
              <label htmlFor="otp" className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted">
                Reset Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength="6"
                value={formData.otp}
                onChange={handleChange}
                placeholder="000000"
                className={`w-full h-11 px-4 text-center tracking-[0.5em] border rounded bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none input-glow transition-all ${
                  fieldErrors.otp ? 'border-red-500 focus:border-red-500' : 'border-outline-variant'
                }`}
              />
              {fieldErrors.otp && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm tracking-normal">
                  {fieldErrors.otp}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="relative">
              <label htmlFor="new_password" className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted">
                New Password
              </label>
              <input 
                id="new_password" 
                name="new_password"
                type={showPassword ? "text" : "password"}
                value={formData.new_password}
                onChange={handleChange}
                placeholder="••••••" 
                className={`w-full h-11 pl-4 pr-10 border rounded bg-transparent font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all tracking-[0.2em] ${
                  fieldErrors.new_password ? 'border-red-500 focus:border-red-500' : 'border-outline-variant'
                }`} 
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
              {fieldErrors.new_password && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm tracking-normal">
                  {fieldErrors.new_password}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="relative">
              <label htmlFor="confirm_password" className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted">
                Confirm New Password
              </label>
              <input 
                id="confirm_password" 
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••" 
                className={`w-full h-11 pl-4 pr-10 border rounded bg-transparent font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all tracking-[0.2em] ${
                  fieldErrors.confirm_password ? 'border-red-500 focus:border-red-500' : 'border-outline-variant'
                }`} 
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

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full h-11 font-title-lg text-title-lg rounded transition-all btn-glow mt-4 bg-primary-container text-on-primary disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Updating...' : 'Reset Password'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

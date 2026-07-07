import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../../features/auth/authThunks';
import {
  getBackendFieldErrors,
  getGlobalErrorMessage,
} from '../../utils/authErrorUtils';

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    if (fieldErrors.email) {
      setFieldErrors((prev) => ({
        ...prev,
        email: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (err) {
      const { errors, globalMessages } = getBackendFieldErrors(err, ['email']);

      if (Object.keys(errors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
      }

      if (globalMessages.length > 0) {
        globalMessages.forEach((message) => toast.error(message));
      } else if (Object.keys(errors).length === 0) {
        toast.error(getGlobalErrorMessage(err, 'Failed to send reset OTP.'));
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
            Let's get you back to improving your city.
          </p>
        </div>
      </div>

      {/* Right Panel: Forgot Password Form */}
      <div className="w-full md:w-[55%] bg-surface-container-lowest flex flex-col justify-center items-center p-4 md:py-4 md:px-8 shadow-[-20px_0_40px_rgba(26,54,93,0.05)] z-10">
        <div className="w-full max-w-md">
          
          <div className="mb-5">
            <h2 className="font-headline-kpi text-headline-kpi text-text-primary mb-1">
              Reset Password
            </h2>
            <p className="font-body-md text-body-md text-text-muted">
              Enter your email address and we'll send you a code to reset your password.
            </p>
          </div>

          {!isSubmitted ? (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="relative">
                <label htmlFor="email" className="absolute -top-2.5 left-3 bg-surface-container-lowest px-1 font-label-sm text-label-sm text-text-muted">
                  Email Address
                </label>
                <input 
                  id="email" 
                  name="email"
                  type="email" 
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="name@example.com" 
                  className={`w-full h-11 px-4 border rounded bg-transparent font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all ${
                    fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-outline-variant'
                  }`} 
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full h-11 font-title-lg text-title-lg rounded transition-all btn-glow mt-4 bg-primary-container text-on-primary disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending Code...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <div className="bg-green-50/10 border border-green-500/30 rounded p-4 text-center mt-4">
              <span className="material-symbols-outlined text-green-500 mb-2 text-3xl">
                mark_email_read
              </span>
              <h3 className="font-title-md text-text-primary mb-1">Check your email</h3>
              <p className="font-body-sm text-text-muted">
                We have sent a password reset code to <strong>{email}</strong>
              </p>
              <button
                onClick={() => navigate('/reset-password')}
                className="mt-4 text-text-primary font-bold hover:underline"
              >
                Enter Code & Reset Password
              </button>
            </div>
          )}

          <div className="mt-6 text-center font-body-md text-body-md text-text-muted text-sm md:text-base">
            Remember your password? <Link to="/login" className="text-text-primary font-bold hover:underline ml-1">Back to Login</Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}

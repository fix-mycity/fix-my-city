import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/auth/authThunks';

const FIELD_NAMES = new Set(['email', 'password']);

const cleanBackendMessage = (message) =>
  String(message || 'Invalid value.').replace(/^Value error,\s*/i, '');

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
  } else if (detail && typeof detail === 'object') {
    Object.entries(detail).forEach(([fieldName, message]) => {
      if (FIELD_NAMES.has(fieldName)) {
        errors[fieldName] = cleanBackendMessage(message);
      }
    });
  }

  return { errors, globalMessages };
};

const getGlobalErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (typeof error?.detail === 'string') return error.detail;
  if (typeof error?.message === 'string') return error.message;
  return 'Login failed. Please try again.';
};

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'citizen'
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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

    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors.');
      return;
    }

    try {
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      })).unwrap();
      toast.success('Logged in successfully!');

      const user = result?.data?.user;
      if (user) {
        const permissions = user.permissions || [];
        let deptPermissions = permissions.filter(p => p.startsWith('dept:'));

        if (deptPermissions.length === 0) {
          if (permissions.some(p => p.startsWith('waste:'))) {
            deptPermissions = ['dept:waste'];
          } else if (permissions.some(p => p.startsWith('water:'))) {
            deptPermissions = ['dept:water'];
          } else if (permissions.some(p => p.startsWith('traffic:'))) {
            deptPermissions = ['dept:traffic'];
          }
        }

        if (user.role === 'Citizen') {
          navigate('/dashboard', { replace: true });
        } else if (user.role === 'Department_Admin' || user.role === 'Super_Admin') {
          if (deptPermissions.length === 1) {
            const perm = deptPermissions[0];
            if (perm === 'dept:traffic') {
              navigate('/traffic/dashboard', { replace: true });
            } else if (perm === 'dept:water') {
              navigate('/water/dashboard', { replace: true });
            } else if (perm === 'dept:waste') {
              navigate('/waste/dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          } else if (deptPermissions.length >= 2) {
            navigate('/admin/portal', { replace: true });
          } else {
            navigate('/waste/dashboard', { replace: true });
          }
        } else if (user.role === 'Worker') {
          navigate('/worker/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const { errors, globalMessages } = getBackendFieldErrors(err);

      if (Object.keys(errors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
        toast.error('Please correct the highlighted errors.');
      }

      if (globalMessages.length > 0) {
        globalMessages.forEach((message) => toast.error(message));
      } else if (Object.keys(errors).length === 0) {
        toast.error(getGlobalErrorMessage(err));
      }
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      
      {/* Minimal Header for Back Navigation (Mobile) */}
      <header className="absolute top-0 left-0 w-full p-4 flex items-center z-10 lg:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="text-on-primary flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="text-label-sm font-medium">Back</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Panel: Brand / Marketing */}
        <section className="lg:w-[45%] bg-primary-container text-on-primary flex flex-col justify-center px-margin-mobile lg:px-margin-desktop py-12 lg:py-24 relative overflow-hidden">
          
          <button 
            onClick={() => navigate('/')}
            className="absolute top-margin-desktop left-margin-desktop hidden lg:flex items-center gap-2 text-on-primary hover:text-secondary-fixed transition-colors z-10"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-label-caps">Return to Main</span>
          </button>
          
          <div className="max-w-md mx-auto w-full relative z-10 flex flex-col gap-stack-md">
            <div className="mb-8">
              <svg fill="none" height="80" viewBox="0 0 80 80" width="80" xmlns="http://www.w3.org/2000/svg">
                <rect fill="white" fillOpacity="0.1" height="80" rx="16" width="80"></rect>
                <path d="M40 20L20 60H32L40 44L48 60H60L40 20Z" fill="white"></path>
              </svg>
            </div>
            
            <h1 className="text-display-lg-mobile lg:text-display-lg text-on-primary">
              Welcome Back
            </h1>
            <p className="text-body-md text-on-primary/80 max-w-sm">
              Sign in to access your dashboard and manage everything in one place.
            </p>
          </div>
        </section>

        {/* Right Panel: Login Form */}
        <section className="lg:w-[55%] bg-surface-container-lowest flex flex-col justify-center px-margin-mobile lg:px-[10%] py-12 lg:py-24">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8 flex flex-col gap-stack-sm">
              <h2 className="text-headline-kpi text-text-primary">Sign In</h2>
              <p className="text-body-md text-text-muted">Enter your credentials to continue</p>
            </div>
            
            {/* Added gap-5 to create vertical spacing between fields */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              
              {/* Email Field */}
              <div className="relative">
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder=" " 
                  value={formData.email}
                  onChange={handleChange}
                  // Restored "rounded" so it has corners on all sides
                  className={`block px-4 pb-2.5 pt-6 w-full text-body-md text-on-surface bg-surface-container rounded border appearance-none focus:outline-none focus:ring-1 peer ${
                    fieldErrors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-outline-variant focus:border-primary-container focus:ring-primary-container'
                  }`}
                />
                <label 
                  htmlFor="email"
                  className="absolute text-label-sm text-text-muted duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-primary-container peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-body-md peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  Email
                </label>
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  placeholder=" " 
                  value={formData.password}
                  onChange={handleChange}
                  // Restored "rounded"
                  className={`block px-4 pb-2.5 pt-6 w-full text-body-md text-on-surface bg-surface-container rounded border appearance-none focus:outline-none focus:ring-1 peer pr-12 ${
                    fieldErrors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-outline-variant focus:border-primary-container focus:ring-primary-container'
                  }`}
                />
                <label 
                  htmlFor="password"
                  className="absolute text-label-sm text-text-muted duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-primary-container peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-body-md peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  Password
                </label>
                <button 
                  type="button"
                  aria-label="Toggle password visibility" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[28px] -translate-y-1/2 text-text-muted hover:text-text-primary focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-body-sm">
                    {fieldErrors.password}
                  </p>
                )}
              </div>


              {/* Forgot Password - Added negative margin to pull it slightly closer to the form if desired, or keep as is */}
              <div className="flex items-center justify-end mt-[-8px]">
                <Link to="/forgot-password" className="text-label-sm text-primary-container hover:text-secondary font-semibold transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-primary-container hover:bg-secondary text-on-primary font-bold py-3 px-4 rounded text-body-md transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-container disabled:opacity-50 mt-2"
              >
                {status === 'loading' ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-body-md text-text-muted">
                Not registered yet?{' '}
                <Link to="/register" className="text-primary-container font-bold hover:underline">
                  Register now
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/useAuth';

const DEMO_REGISTERED_MOBILE = '9999999999';
const DEMO_REGISTERED_EMAIL = 'owner@business.com';

export function LoginScreen() {
  const { loginMethod, setLoginMethod, setLoginValue, setScreen, setIsNewUser } =
    useAuth();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function validate(): boolean {
    if (loginMethod === 'mobile') {
      if (!/^[6-9]\d{9}$/.test(value)) {
        setError('Enter a valid 10-digit Indian mobile number');
        return false;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError('Enter a valid email address');
        return false;
      }
    }
    setError('');
    return true;
  }

  function handleSendOtp() {
    if (!validate()) return;

    const isRegistered =
      loginMethod === 'mobile'
        ? value === DEMO_REGISTERED_MOBILE
        : value === DEMO_REGISTERED_EMAIL;

    setLoginValue(value);
    setIsNewUser(!isRegistered);
    setScreen('otp');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSendOtp();
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-10">
        <Logo size="lg" />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
        <h2 className="text-white text-xl font-semibold text-center mb-1">
          Welcome back
        </h2>
        <p className="text-blue-200 text-sm text-center mb-6">
          Sign in to manage your vendor payments
        </p>

        {/* Toggle: Mobile / Email */}
        <div className="flex rounded-xl overflow-hidden border border-white/20 mb-5">
          <button
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              loginMethod === 'mobile'
                ? 'bg-white text-navy-900'
                : 'text-blue-200 hover:text-white'
            }`}
            onClick={() => {
              setLoginMethod('mobile');
              setValue('');
              setError('');
            }}
            aria-pressed={loginMethod === 'mobile'}
          >
            📱 Mobile
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              loginMethod === 'email'
                ? 'bg-white text-navy-900'
                : 'text-blue-200 hover:text-white'
            }`}
            onClick={() => {
              setLoginMethod('email');
              setValue('');
              setError('');
            }}
            aria-pressed={loginMethod === 'email'}
          >
            ✉️ Email
          </button>
        </div>

        {/* Input */}
        <div className="mb-2">
          <label className="block text-blue-200 text-xs font-medium mb-1.5">
            {loginMethod === 'mobile' ? 'Mobile Number' : 'Email Address'}
          </label>
          {loginMethod === 'mobile' ? (
            <div className="flex rounded-xl overflow-hidden border border-white/25 bg-white/10">
              <span className="flex items-center px-3 text-white text-sm font-medium border-r border-white/25 bg-white/5 select-none">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="9876543210"
                className="flex-1 bg-transparent px-3 py-3 text-white placeholder-white/30 text-sm outline-none"
                aria-label="Mobile number"
              />
            </div>
          ) : (
            <input
              type="email"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-blue-300"
              aria-label="Email address"
            />
          )}
          {error && (
            <p className="text-red-300 text-xs mt-1.5" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Send OTP button */}
        <button
          onClick={handleSendOtp}
          className="w-full mt-5 py-3.5 rounded-xl bg-blue-400 hover:bg-blue-300 active:scale-95 text-navy-900 font-semibold text-sm transition-all shadow-lg shadow-blue-900/40"
        >
          Send OTP →
        </button>

        {/* Hint for demo */}
        <p className="text-white/30 text-xs text-center mt-4">
          Demo: use <span className="text-white/50">9999999999</span> (existing) or any other number (new user)
        </p>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/useAuth';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;
// In a real app, the OTP would be sent via SMS/email. For demo purposes we use a fixed OTP.
const DEMO_OTP = '1234';

export function OtpScreen() {
  const { loginValue, loginMethod, isNewUser, setScreen } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  function handleChange(index: number, char: string) {
    if (!/^\d?$/.test(char)) return;
    const next = [...otp];
    next[index] = char;
    setOtp(next);
    setError('');
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const next = [...otp];
        next[index - 1] = '';
        setOtp(next);
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
    e.preventDefault();
  }

  function handleVerify() {
    const entered = otp.join('');
    if (entered.length < OTP_LENGTH) {
      setError('Please enter the complete OTP');
      return;
    }
    if (entered !== DEMO_OTP) {
      setError('Incorrect OTP. Try 1234 for demo.');
      return;
    }
    setError('');
    setVerified(true);
    setTimeout(() => {
      setScreen(isNewUser ? 'register' : 'dashboard');
    }, 600);
  }

  function handleResend() {
    if (resendTimer > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setResendTimer(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
  }

  const maskedValue =
    loginMethod === 'mobile'
      ? `+91 ••••• ${loginValue.slice(-5)}`
      : loginValue.replace(/(.{2}).+(@.+)/, '$1••••$2');

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-10">
        <Logo size="md" />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
        {/* Back button */}
        <button
          onClick={() => setScreen('login')}
          className="flex items-center gap-1.5 text-blue-300 text-sm mb-4 hover:text-white transition-colors"
          aria-label="Go back to login"
        >
          ← Back
        </button>

        <h2 className="text-white text-xl font-semibold mb-1">
          Verify OTP
        </h2>
        <p className="text-blue-200 text-sm mb-1">
          We've sent a 4-digit OTP to
        </p>
        <p className="text-white text-sm font-medium mb-6">{maskedValue}</p>

        {/* OTP inputs */}
        <div className="flex justify-center gap-3 mb-3" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className={`w-14 h-14 rounded-xl border text-center text-2xl font-bold text-white bg-white/10 outline-none transition-all
                ${digit ? 'border-blue-300' : 'border-white/25'}
                ${verified ? 'border-green-400 bg-green-400/20' : ''}
                ${error ? 'border-red-400' : ''}
                focus:border-blue-300`}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-300 text-xs text-center mb-2" role="alert">
            {error}
          </p>
        )}

        {verified && (
          <p className="text-green-300 text-xs text-center mb-2">
            ✓ Verified! Redirecting…
          </p>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={verified}
          className="w-full mt-4 py-3.5 rounded-xl bg-blue-400 hover:bg-blue-300 active:scale-95 text-navy-900 font-semibold text-sm transition-all shadow-lg shadow-blue-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Verify OTP
        </button>

        {/* Resend */}
        <div className="text-center mt-4">
          {resendTimer > 0 ? (
            <p className="text-blue-300 text-xs">
              Resend OTP in{' '}
              <span className="text-white font-medium">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-blue-300 text-sm hover:text-white transition-colors"
            >
              Resend OTP
            </button>
          )}
        </div>

        <p className="text-white/30 text-xs text-center mt-4">
          Demo OTP: <span className="text-white/50">1234</span>
        </p>
      </div>
    </div>
  );
}

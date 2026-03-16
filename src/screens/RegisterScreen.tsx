import { useState } from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/useAuth';
import type { BusinessProfile } from '../types';

const CURRENCIES = [
  { code: 'INR', label: '₹ Indian Rupee (INR)' },
  { code: 'USD', label: '$ US Dollar (USD)' },
  { code: 'EUR', label: '€ Euro (EUR)' },
  { code: 'GBP', label: '£ British Pound (GBP)' },
  { code: 'AED', label: 'د.إ UAE Dirham (AED)' },
  { code: 'SGD', label: 'S$ Singapore Dollar (SGD)' },
];

interface FieldError {
  name?: string;
  location?: string;
  currency?: string;
}

export function RegisterScreen() {
  const { setScreen, setBusinessProfile } = useAuth();
  const [form, setForm] = useState<BusinessProfile>({
    name: '',
    location: '',
    currency: 'INR',
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const next: FieldError = {};
    if (!form.name.trim()) next.name = 'Business name is required';
    else if (form.name.trim().length < 2) next.name = 'Name must be at least 2 characters';

    if (!form.location.trim()) next.location = 'Location is required';

    if (!form.currency) next.currency = 'Please select a currency';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(field: keyof BusinessProfile, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setBusinessProfile(form);
      setSaving(false);
      setScreen('dashboard');
    }, 800);
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-8">
        <Logo size="sm" />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
        <div className="mb-5">
          <h2 className="text-white text-xl font-semibold mb-1">
            Set up your business
          </h2>
          <p className="text-blue-200 text-sm">
            Tell us about your business to get started
          </p>
        </div>

        {/* Business Name */}
        <div className="mb-4">
          <label className="block text-blue-200 text-xs font-medium mb-1.5">
            Business Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Sharma General Stores"
            className={`w-full rounded-xl border bg-white/10 px-4 py-3 text-white placeholder-white/30 text-sm outline-none transition-colors
              ${errors.name ? 'border-red-400' : 'border-white/25 focus:border-blue-300'}`}
            aria-label="Business name"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-red-300 text-xs mt-1" role="alert">{errors.name}</p>
          )}
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-blue-200 text-xs font-medium mb-1.5">
            Business Location <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g. Mumbai, Maharashtra"
            className={`w-full rounded-xl border bg-white/10 px-4 py-3 text-white placeholder-white/30 text-sm outline-none transition-colors
              ${errors.location ? 'border-red-400' : 'border-white/25 focus:border-blue-300'}`}
            aria-label="Business location"
            aria-invalid={!!errors.location}
          />
          {errors.location && (
            <p className="text-red-300 text-xs mt-1" role="alert">{errors.location}</p>
          )}
        </div>

        {/* Currency */}
        <div className="mb-6">
          <label className="block text-blue-200 text-xs font-medium mb-1.5">
            Preferred Currency <span className="text-red-400">*</span>
          </label>
          <select
            value={form.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className={`w-full rounded-xl border bg-navy-900 px-4 py-3 text-white text-sm outline-none transition-colors appearance-none cursor-pointer
              ${errors.currency ? 'border-red-400' : 'border-white/25 focus:border-blue-300'}`}
            aria-label="Preferred currency"
            aria-invalid={!!errors.currency}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-navy-900">
                {c.label}
              </option>
            ))}
          </select>
          {errors.currency && (
            <p className="text-red-300 text-xs mt-1" role="alert">{errors.currency}</p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-blue-400 hover:bg-blue-300 active:scale-95 text-navy-900 font-semibold text-sm transition-all shadow-lg shadow-blue-900/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              Setting up…
            </>
          ) : (
            'Complete Setup →'
          )}
        </button>
      </div>
    </div>
  );
}
